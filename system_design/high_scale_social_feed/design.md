This as a **Facebook-like feed system**, not claim this is Meta’s exact internal architecture.

Assume you are in **Austin**, open the app, and request your home feed.

The important thing is that your request usually does **not** go straight from your phone to one giant database. It touches several layers, and some of the feed may already have been precomputed before you opened the app.

## 1. You open the app in Austin

Your phone already has:

* your auth token/session
* some cached feed items
* device/app metadata
* maybe the last pagination cursor

The app calls something like:

```http
GET /feed?cursor=abc123
Authorization: Bearer ...
```

Your network path is approximately:

```text
Phone
  ↓
Wi-Fi / 5G
  ↓
ISP / cellular carrier
  ↓
DNS
  ↓
nearest edge / CDN / Anycast POP
```

Because you're in Austin, traffic would normally enter the provider's network through a geographically nearby edge location, likely somewhere in Texas or a nearby regional POP.

The point of this edge layer is:

* terminate TLS
* absorb DDoS traffic
* enforce coarse rate limits
* possibly cache static assets
* route you toward the appropriate backend region

---

# 2. Edge / CDN / load balancer

Your request reaches something like:

```text
Edge POP
   ↓
Global Load Balancer
   ↓
US Central backend region
```

The global load balancer chooses a region based on things like:

* proximity
* current load
* health
* data locality
* failover state

Maybe your traffic goes to:

```text
Texas / Central US region
```

or another nearby region.

The request gets assigned things like:

```text
request_id
trace_id
region
client_ip metadata
```

These IDs propagate downstream for observability.

---

# 3. API Gateway

Now it reaches the application boundary:

```text
API Gateway
```

The gateway may do:

* authentication token validation
* rate limiting
* abuse checks
* routing
* request-size validation
* experiment assignment
* feature flags
* telemetry

Example:

```text
GET /feed
    ↓
API Gateway
```

The gateway sees:

```text
user_id = 123
endpoint = /feed
region = us-central
experiment = feed-ranking-v17
```

Then routes the request to a Feed Service.

---

# 4. Feed API / Feed Service

Now we're inside application logic:

```text
Feed Service
```

This service does not usually compute your entire feed from scratch.

It starts by asking:

> Do I already have candidate posts prepared for this user?

So first:

```text
Feed Service
    ↓
Feed Cache
```

Likely something Redis-like or another low-latency key-value store.

Example:

```text
key:
feed:user:123
```

Value:

```text
[
  post_918,
  post_442,
  post_1001,
  post_771,
  ...
]
```

This might be a cached or materialized feed candidate list.

If the cache is healthy and fresh, a huge amount of work has already been avoided.

---

# 5. Where did this cached feed come from?

This is the really interesting part.

A lot of feed generation happens **before you request it**.

Suppose your friend Alice creates a post.

```text
Alice
  ↓
POST /posts
```

The Post Service writes:

```text
posts table / posts shard
```

Maybe:

```text
post_id = 918
author_id = Alice
created_at = ...
```

After the write succeeds:

```text
Post Service
   ↓
Event Stream
```

Something Kafka-like receives:

```text
PostCreated {
  post_id: 918,
  author_id: Alice
}
```

Now downstream feed workers consume that event.

---

# 6. Fan-out workers

A worker asks:

> Who follows Alice?

That data may live in a graph/following service.

```text
Feed Fanout Worker
       ↓
Follower Graph Service
       ↓
Follower Store
```

Suppose Alice has:

```text
Bob
Arun
Carol
David
...
```

The worker may push Alice's post ID into each follower's feed inbox:

```text
feed:Bob   += post_918
feed:Arun  += post_918
feed:Carol += post_918
```

This is called:

# Fan-out on write

Instead of waiting until Arun opens Facebook and calculating everything then, the system partially prepares Arun's feed when Alice posts.

So by the time you request your feed, your feed store may already contain:

```text
Arun Feed Candidate Store

post_918  Alice
post_812  Bob
post_441  Carol
post_771  Dave
...
```

---

# 7. But not every post is fan-out-on-write

Imagine a celebrity with 100 million followers.

If they post once, doing:

```text
100,000,000 feed writes
```

is expensive.

So large systems often use a **hybrid strategy**.

Normal user:

```text
fan-out on write
```

Celebrity:

```text
fan-out on read
```

Meaning their post stays in the author's post stream.

When you request your feed:

```text
precomputed feed candidates
+
celebrity/recent dynamic candidates
```

are merged.

So your Feed Service might do:

```text
Feed Candidate Store
        +
Celebrity Follow Store
        +
Recommendation Service
        +
Ads Service
        ↓
candidate pool
```

---

# 8. Candidate generation

At this point the system may have hundreds or thousands of potential items.

Example:

```text
150 posts from friends
40 group posts
30 suggested posts
15 video candidates
10 celebrity posts
5 ads
```

Now you have:

```text
~250 candidates
```

You only need maybe 20.

So the system doesn't fully score everything equally.

It may first do a cheap filtering pass.

---

# 9. Filtering layer

Candidates may be removed because of:

* blocked users
* muted users
* deleted content
* privacy rules
* geo restrictions
* age restrictions
* already seen content
* spam
* policy violations

So:

```text
250 candidates
    ↓
Eligibility / Policy Filter
    ↓
180 candidates
```

This layer might call:

```text
Privacy Service
Block List Service
Content Safety Store
Experiment Service
```

Usually some of this data is cached because making dozens of remote service calls per post would be too expensive.

---

# 10. Feature retrieval

Now ranking needs information about each candidate.

For a post:

```text
post_id = 918
```

the ranking system may want features like:

```text
how close are Arun and Alice?
how often does Arun like Alice's posts?
how fresh is the post?
post engagement velocity?
content type?
language?
topic?
did Arun previously watch similar videos?
```

These are often stored in a **feature store**.

```text
Ranking Service
    ↓
Online Feature Store
```

Features might look like:

```text
user_author_affinity = 0.87
post_age_minutes = 14
engagement_rate = 0.12
topic_match = 0.72
video_preference = 0.44
```

Some may be computed offline.

Some in real time.

---

# 11. Offline data pipeline

A separate system is constantly processing historical behavior.

Your likes, watches, clicks, comments, shares, hides:

```text
Client events
    ↓
Event Collector
    ↓
Kafka / streaming bus
    ↓
Data Lake
    ↓
Spark / Flink / batch jobs
    ↓
Feature pipelines
    ↓
Feature Store
```

So if you have historically interacted heavily with hiking content, that becomes a feature.

For example:

```text
Arun:
interest_hiking = 0.92
interest_soccer = 0.84
interest_cooking = 0.38
```

These aren't calculated by scanning your entire history every feed request.

They're precomputed.

---

# 12. Ranking model

Now the feed ranking system scores candidates.

Conceptually:

```text
score =
    model(
        user_features,
        post_features,
        author_features,
        context_features
    )
```

The ML model might predict things like:

```text
P(like)
P(comment)
P(share)
P(long_view)
P(hide)
```

Then combine them:

```text
ranking_score =
  1.0 * P(like)
+ 2.0 * P(comment)
+ 3.0 * P(share)
+ 1.5 * P(long_view)
- 5.0 * P(hide)
```

Real ranking is obviously much more complicated, but conceptually this is enough.

Now:

```text
180 candidates
    ↓
ML Ranking
    ↓
top 40
```

---

# 13. Post-ranking rules

You usually don't just take the top 20 model scores.

There may be business/product constraints.

For example:

```text
don't show 5 posts from Alice in a row
don't show 10 videos consecutively
insert one ad after N organic posts
ensure some freshness
ensure source diversity
avoid duplicate stories
```

So:

```text
ranked candidates
    ↓
Re-ranking / diversity
    ↓
final 20
```

---

# 14. Hydration

Up to now, the ranking system may mostly be working with IDs.

```text
post_918
post_442
post_1001
```

Now the frontend needs actual data:

```text
author name
text
image URL
comment count
like count
viewer-specific like state
profile picture
```

The Feed Service performs **hydration**.

Instead of hitting one database per post:

```text
post 1 → DB
post 2 → DB
post 3 → DB
...
```

it batches:

```text
Post Service:
getPosts([918, 442, 1001, ...])
```

Then:

```text
Profile Service:
getUsers([...])
```

Then:

```text
Engagement Service:
getCounts([...])
```

Many of these may hit caches first.

---

# 15. Authoritative databases

Eventually some cache misses reach actual databases.

Suppose posts are sharded by author ID.

```text
Alice → shard 12
Bob   → shard 4
Carol → shard 29
```

Then Post Service uses a shard map:

```text
post_918
   ↓
author_id Alice
   ↓
shard router
   ↓
Post DB shard 12
```

Different feed items can absolutely come from different shards.

The key insight from your earlier question:

**the feed service usually doesn't perform arbitrary cross-shard joins.**

Instead it has IDs already, then it batches targeted fetches.

Something like:

```text
shard 4  → fetch posts 441, 810
shard 12 → fetch posts 918, 930
shard 29 → fetch post 771
```

These can run concurrently.

---

# 16. Media isn't returned from the DB

If Alice's post contains a photo, the database typically contains something like:

```text
media_id
metadata
object_storage_key
```

not the actual image bytes.

The actual file lives in object storage:

```text
Object Store
    ↓
CDN
```

The feed response contains:

```text
https://cdn.example.com/media/abc...
```

So the Feed API sends metadata, not 5 MB JPEGs.

---

# 17. Feed response

The backend returns something like:

```json
{
  "items": [
    {
      "postId": "918",
      "author": {...},
      "text": "...",
      "media": {
        "url": "https://cdn..."
      }
    }
  ],
  "cursor": "next_123"
}
```

Response path:

```text
Feed Service
    ↓
API Gateway
    ↓
Edge POP
    ↓
Internet
    ↓
Your phone in Austin
```

---

# 18. Your phone renders the feed

Now the app:

* renders the first few items
* lazily loads images
* prefetches the next page
* caches some feed state

Images go directly:

```text
Phone
  ↓
nearby CDN
  ↓
cached media
```

They usually do not travel through the Feed Service.

---

# 19. You interact with a post

You like Alice's post.

```text
POST /posts/918/like
```

Flow:

```text
Phone
 ↓
Edge
 ↓
API Gateway
 ↓
Engagement Service
```

Engagement Service writes:

```text
likes store
```

Then publishes:

```text
LikeCreated
```

into the event stream.

---

# 20. That one like fans out everywhere internally

That event may be consumed by:

```text
Notification Service
Analytics Pipeline
Ranking Feature Pipeline
Counter Service
Fraud Detection
Recommendation System
Audit/abuse systems
```

For example:

```text
LikeCreated
     │
     ├──→ increment like count
     │
     ├──→ maybe notify Alice
     │
     ├──→ update Arun↔Alice affinity
     │
     ├──→ analytics warehouse
     │
     └──→ future feed ranking
```

Your one click becomes training/feature data for future feeds.

---

# 21. Observability is running through the whole path

Each service emits:

```text
metrics
logs
traces
```

A distributed trace could look like:

```text
trace_id = abc

Feed API                  120 ms
├── Feed Cache             4 ms
├── Candidate Service     18 ms
├── Feature Store         10 ms
├── Ranking Service       22 ms
├── Post Service          28 ms
│   ├── cache              3 ms
│   └── DB shard          12 ms
└── Profile Service       11 ms
```

Metrics might track:

```text
feed_request_p95
feed_request_p99
ranking_latency
cache_hit_rate
DB latency
queue age
fanout lag
candidate count
error rate
```

---

# 22. The write side and read side are deliberately different

This is one of the biggest ideas.

The authoritative write might be:

```text
Alice creates post
    ↓
Post DB
```

But the read path for your feed might be:

```text
Feed Cache
+
Materialized Feed Store
+
Feature Store
+
Post Cache
+
Ranking System
```

This is intentional.

The normalized database is optimized for truth.

The feed infrastructure is optimized for:

> "Give Arun the best 20 posts in 200 ms."

Those are completely different access patterns.

---

# 23. Full end-to-end picture

Putting it all together:

```text
                    WRITE SIDE

Alice's Phone
     ↓
Edge / CDN
     ↓
API Gateway
     ↓
Post Service
     ↓
Post Cache / DB shard
     ↓
Kafka / Event Bus
     ↓
Feed Fanout Workers
     ↓
Follower Graph
     ↓
Arun's Feed Candidate Store
                  │
                  │
                  ▼

                    READ SIDE

Arun's Phone — Austin
     ↓
ISP / 5G
     ↓
DNS / Anycast
     ↓
Nearby Edge POP
     ↓
Global Load Balancer
     ↓
API Gateway
     ↓
Feed Service
     ↓
Feed Candidate Cache
     ↓
Candidate Generation
     ├── Precomputed feed
     ├── Celebrity posts
     ├── Recommendations
     └── Ads
     ↓
Eligibility / Privacy Filtering
     ↓
Online Feature Store
     ↓
ML Ranking
     ↓
Re-ranking / Diversity
     ↓
Hydration
     ├── Post Service
     │      ↓
     │   Cache
     │      ↓
     │   Sharded DB
     │
     ├── Profile Service
     ├── Engagement Service
     └── Media metadata
     ↓
Feed Response
     ↓
Edge
     ↓
Arun's Phone
     ↓
Images/videos fetched from CDN
```

---

## The deeper lesson

A Facebook-style feed is a perfect example of why large distributed systems don't simply do:

```text
SELECT *
FROM posts
JOIN follows
WHERE followed_by = Arun
ORDER BY created_at
LIMIT 20;
```

At small scale, that is exactly what you might do.

At huge scale, it becomes:

**writes create events → events build specialized read models → ranking consumes precomputed features → databases remain authoritative → caches and materialized views serve the hot read path.**

The distributed system is therefore really several systems layered together:

```text
System of record
Event system
Feed materialization system
Feature system
Ranking system
Caching system
Media delivery system
Observability system
Analytics system
```

And they are all cooperating to make your feed look like one simple API call.
