export interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  what_it_means: string;
  submitted_by: string;
  poster_url: string;
  trailer_url: string;
  release_year: number | null;
  upvotes: number;
  is_featured: boolean;
  created_at: string;
}

export interface CinemaCardProps {
  movie: Movie;
  variant?: "poster" | "landscape" | "compact";
}

export interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export interface GlowBadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "burgundy" | "ember" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

export interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
  borderRadius?: string;
}

export interface SpotlightHoverProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
  spotlightOpacity?: number;
}
