
# Virtual Science Lab Simulations

This project is a modern, interactive platform for virtual science laboratory simulations. It features a collection of labs in Chemistry, Physics, Biology, Astronomy, Genetics, and Environmental Science, designed for students and educators to explore and experiment online.

## Features
- Interactive lab cards for various science disciplines
- Chemistry and Physics labs mapped to external interactive simulations
- Admin profile and ability to add new labs
- Responsive, modern UI with Tailwind CSS and shadcn/ui components
- Built with React, Vite, and TypeScript

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
1. Clone the repository:
	```sh
	git clone <repo-url>
	cd virtual-lab-simulations-main
	```
2. Install dependencies:
	```sh
	npm install
	# or
	bun install
	```

### Running the App
Start the development server:
```sh
npm run dev
# or
bun run dev
```

Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).

## Project Structure
- `src/pages/Index.tsx` — Main landing page with lab cards
- `src/components/` — UI components (LabCard, AddLabModal, AdminProfile, etc.)
- `src/assets/` — Images and static assets
- `public/` — Static files

## Customization
- To add new labs, use the "Add New Lab" button in the UI.
- Chemistry and Physics labs are mapped to external URLs. You can update these in `src/pages/Index.tsx`.

## License
MIT

---
Created by Jeswin and contributors.
