# How WhatsApp Handles Ten Billion Messages

This article provides a comprehensive technical breakdown for building a high-scale messaging platform, specifically focusing on the architectural challenges of a service like WhatsApp. The authors emphasize a scalable infrastructure capable of managing billions of users by utilizing WebSockets for persistent, real-time communication and a decoupled notification system for offline delivery. Key structural themes include the implementation of a dedicated presence service to track user status and the use of pre-signed URLs to offload heavy media transfers from primary chat servers. Ultimately, the guide serves as a practical playbook for engineers to understand the trade-offs between various protocols and the necessity of service discovery in maintaining a resilient, distributed system.

[Listen to the NotebookLM audio](https://notebook.google.com/notebook/26938b08-cddd-4155-8de9-0aeb5ece0259/artifact/850bb6ee-738b-46fa-938f-6f3be652a75b)

Credit: Neo Kim · Audio generated with Google NotebookLM.
