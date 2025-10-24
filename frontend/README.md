# Frontend

Uses [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) with [Vite](https://vitejs.dev/) to scaffold it.

## React + TypeScript + Vite

Vite is a minmal bundler for React apps. I used React during my Co-op and in some of my other classes, so I decided to use it for this project as well.

Using typescript over regular javascript as that's generally the standard for new projects. It helps avoid a lot of annoying bugs and generally makes the dev experience less painful.

## Running the app

Make sure you've got node installed and are in the `frontend` directory.
First time setup requires you to install the dependencies: `npm install`
Once that's done, you can run the app with `npm run dev`

## General notes
Using a few libaries to make the app look nicer and make it easier to work with.
- [Monaco Editor](https://www.npmjs.com/package/@monaco-editor/react#simple-usage)
  - Used for the code editor itself, VSCode's editor, but as a web component
- [Tailwind CSS](https://tailwindcss.com/)
  - Used for styling the app
  - Overall it's faster than CSS modules, faster dev and less file jumping to get the desired styles
- [Lucide](https://lucide.dev)
  - My icon library, contains a bunch of useful icons that I don't need to make from scratch
- [React Router](https://reactrouter.com/home)
  - While not scaffolded with it, the routing is all handled by it and is easy to understand what its doing
  - The single page app makes use of react router to handle the content switching
  - Single page app as There's not a lot of content/pages its basic CRUD UI and the editor
  
## Useful resources
- Of course the official docs for everything I've linked to above
- https://www.youtube.com/watch?v=pfaSUYaSgRo
- https://www.youtube.com/watch?v=PuovsjZN11Y
- https://www.youtube.com/watch?v=DenUCuq4G04