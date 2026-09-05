# How YouTube Handles 100 Million Daily Users

This text provides a comprehensive blueprint for architecting a video-sharing platform by breaking the challenge into upload and streaming pipelines. The author emphasizes that a massive scale requires a hybrid database strategy, utilizing PostgreSQL for metadata, DynamoDB for high-throughput watch progress, and S3 for exabyte-level file storage. Key architectural themes include the use of asynchronous transcoding via DAGs to transform videos into multiple resolutions and the deployment of a global CDN for adaptive bitrate streaming to ensure low-latency playback. Ultimately, the source serves as a technical guide for navigating system design interviews, illustrating how to balance reliability, availability, and performance through deliberate engineering trade-offs.

[Listen to the NotebookLM audio](https://notebook.google.com/notebook/26938b08-cddd-4155-8de9-0aeb5ece0259/artifact/8c366892-58a6-46e6-ba71-8057638544f5)

Credit: Neo Kim · Audio generated with Google NotebookLM.
