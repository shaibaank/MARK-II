
# Mini-Project 3

A modern React application built with Next.js and TypeScript featuring a customizable UI component library with a functional Todo list implementation.

## Features

- Responsive Todo list component with add, toggle, and delete functionality
- Customizable Button component with various variants and sizes
- Form control components (Input, Textarea, Select, Checkbox)
- TypeScript for type safety and better developer experience

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mini-project3.git

# Navigate to the project directory
cd mini-project3

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Usage

### Todo Component

The Todo component provides a complete interface for managing todo items:

```jsx
import Todo from "./components/Todo";

function App() {
  return (
    <div className="container mx-auto p-4">
      <Todo />
    </div>
  );
}
```

### Button Component

The Button component supports multiple variants, sizes, and states:

```jsx
import Button from "./components/Button";

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="danger">Danger</Button>
<Button variant="destructive">Delete</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Loading</Button>

// Full width
<Button isFullWidth>Full Width</Button>

// With icons
<Button leftIcon={<Icon />}>With Left Icon</Button>
<Button rightIcon={<Icon />}>With Right Icon</Button>
```

### Form Components

```jsx
import { 
  FormControl, 
  Label, 
  Input, 
  Textarea, 
  Select, 
  Checkbox, 
  HelperText 
} from "./components/FormControl";

// Form with various controls
<FormControl>
  <Label htmlFor="name" required>Name</Label>
  <Input 
    id="name" 
    placeholder="Enter your name" 
    error={errors.name}
  />
  <HelperText>Enter your full name</HelperText>
</FormControl>
```

## Component Props

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' \| 'danger' \| 'destructive' | 'primary' | Button style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| isLoading | boolean | false | Shows loading spinner when true |
| isFullWidth | boolean | false | Makes button full width |
| leftIcon | ReactNode | - | Icon to display before text |
| rightIcon | ReactNode | - | Icon to display after text |
| className | string | '' | Additional CSS classes |
| ...props | ButtonHTMLAttributes | - | All standard HTML button attributes |

## Technologies Used

- React
- Next.js
- TypeScript
- Tailwind CSS

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



