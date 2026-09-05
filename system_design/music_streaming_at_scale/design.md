# How Music Streaming Apps Scale

This guide outlines the architectural blueprint for a large-scale music streaming service, focusing on the balance between audio delivery and metadata management. The system utilizes blob storage and CDNs to efficiently serve massive audio files, while relying on relational databases to handle complex queries for song details and user playlists. To ensure a seamless experience, the design incorporates adaptive bitrate streaming to prevent buffering and horizontal scaling to manage millions of concurrent users. Ultimately, the text provides a practical framework for navigating system design interviews, emphasizing reliability through techniques like leader-follower replication and circuit breakers.

[Listen to the NotebookLM audio](https://notebook.google.com/notebook/26938b08-cddd-4155-8de9-0aeb5ece0259/artifact/1fa0b10f-f44f-4d4b-b0bd-3b9dd32f6c7f)

Credit: Neo Kim · Audio generated with Google NotebookLM.
