# General structure
```
src/
├── pages/                           # My main pages
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── ProfilePage.tsx
│   └── EditorPage.tsx
├── components/                      # Reusable components
│   ├── Desktop/                     # Desktop components
│   │   ├── layout/                  # Layout components - more general/layout related
│   │   │   ├── MainLayout.tsx
│   │   │   └── SideBar.tsx
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── editor/
│   │   │   └── OutputPanel.tsx
│   │   ├── profile/
│   │   │   └── ProjectGrid.tsx
│   │   ├── home/
│   │   │   └── FeedList.tsx
│   │   ├── search/
│   │   │   └── SearchResults.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── ...
│   └── Mobile/
│       └── ...                      # Mobile components - same as Desktop but for mobile/smaller screens
├── hooks/                           # Probably not gonna be used?
│   └── ...
├── services/                        # Services to help with backend communication - like API calls, auth, etc
│   └── ...                           
├── types/                           # Types to help sync with backend and keep consistency, like models in .NET
│   └── ...
├── App.tsx
├── main.tsx
└── index.css
```

# How to run
**setup**: First time only, once you've cloned the repo from the root run `cd frontend` then run `npm install` to install all the dependencies.

**run**: run `npm start` to start the development server.