# Component Architecture

The following diagram illustrates the architecture and relationships between the components in our Marketing Platform UI.

```mermaid
graph TD
    A[App] --> B[Router]
    B --> C[DemoPage]
    B --> D[Other Pages...]
    
    C --> E[Tabs Component]
    E --> F[Tab Items]
    F --> G[Overview Content]
    F --> H[Create Campaign]
    F --> I[Content Form]
    F --> J[Analytics Tab]
    F --> K[Settings Tab]
    
    H --> L[Campaign Form Data]
    I --> M[Content Form Data]
    I --> N[Media Upload]
    
    subgraph "Core Components"
        E
        H
        I
    end
    
    subgraph "Data Flow"
        L --> O[API Services]
        M --> O
        N --> P[Storage Services]
    end
    
    subgraph "State Management"
        Q[Local Component State]
        R[Context API/Redux]
        Q --> R
    end
```

This diagram shows how our components are structured and interact with each other. The Tabs component serves as a container for various content sections, while the form components handle specific functionality for campaign creation and content management.