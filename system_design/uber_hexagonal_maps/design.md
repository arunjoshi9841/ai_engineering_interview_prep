# Why Uber Maps the World with Hexagons

This technical case study explores how Uber utilizes a hexagonal hierarchical geospatial indexing system called H3 to manage over one million driver requests per second. The author explains that by dividing the earth into a hexagonal grid, the platform simplifies distance calculations and uses a hierarchical structure to adjust data resolution based on local demand. To ensure reliability and speed, the architecture incorporates map matching to refine messy GPS signals, while leveraging Ringpop and consistent hashing to distribute the massive workload across its server network. Ultimately, the text illustrates the complex system design required to connect riders and drivers instantly by prioritizing efficient location storage and high-performance data partitioning.

[Listen to the NotebookLM audio](https://notebook.google.com/notebook/26938b08-cddd-4155-8de9-0aeb5ece0259/artifact/c7eafcd5-4f3b-46da-a17f-b19b401aacc7)

Credit: Neo Kim · Audio generated with Google NotebookLM.
