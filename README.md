# VersoBid - Reverse Auction Platform

VersoBid is a revolutionary reverse auction platform where buyers post items they want to purchase and sellers compete to fulfill these requests. This creates a unique marketplace that empowers buyers to set their desired prices while allowing sellers to find customers actively seeking their products.

## 🚀 Features

- **Reverse Auction System**: Buyers post items they want, sellers bid to fulfill
- **User Roles**: Separate interfaces for buyers and sellers
- **Real-time Bidding**: Live updates for bids and auction status
- **Secure Authentication**: Powered by Supabase
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Built-in theme switching capability

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **File Storage**: Supabase Storage
- **Build Tool**: Vite
- **Deployment**: Netlify

## 🚦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/versobid.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Project Structure

```
versobid/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── stores/        # Zustand stores
│   ├── lib/           # Utility functions and configurations
│   └── types/         # TypeScript type definitions
├── public/           # Static assets
└── ...config files
```

## 🔒 Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🚀 Deployment

The project is configured for deployment on Netlify. The `netlify.toml` file includes the necessary build settings.

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)