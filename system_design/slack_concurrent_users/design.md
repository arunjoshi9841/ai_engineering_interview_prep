# How Slack Handles Seven Million Concurrent Users

This article provides a comprehensive technical breakdown of Slack’s architecture, moving from a simple prototype to a complex, globally distributed real-time messaging system. It details the transition from a standard client-server model to a sophisticated infrastructure utilizing WebSockets for full-duplex communication and cursor-based pagination for efficient data retrieval. Key architectural components explored include the gateway server, which manages active client connections via the actor programming model, and the snapshot service, an application-level edge cache that optimizes initial load times and reduces server strain. Ultimately, the text illustrates how Slack achieves high availability and scalability by leveraging database sharding through Vitess and a robust publish-subscribe pattern to manage billions of daily messages.

[Listen to the NotebookLM audio](https://notebook.google.com/notebook/26938b08-cddd-4155-8de9-0aeb5ece0259/artifact/492939f0-8743-4020-bf8d-4ed36b0070fe)

Credit: Neo Kim · Audio generated with Google NotebookLM.
