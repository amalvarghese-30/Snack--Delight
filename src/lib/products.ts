import almonds from "@/assets/cat-almonds.jpg";
import cashews from "@/assets/cat-cashews.jpg";
import pistachios from "@/assets/cat-pistachios.jpg";
import dates from "@/assets/cat-dates.jpg";
import trailmix from "@/assets/cat-trailmix.jpg";
import honey from "@/assets/cat-honey.jpg";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  benefits: string[];
};

export const products: Product[] = [
  {
    slug: "california-almonds",
    name: "Premium California Almonds",
    tagline: "Slow-roasted, single-origin",
    price: 24,
    rating: 4.9,
    reviews: 1284,
    image: almonds,
    category: "Almonds",
    description:
      "Hand-selected from the heart of California's Central Valley, these almonds are slow-roasted to bring out a buttery, deeply nutty character.",
    benefits: ["Rich in Vitamin E", "Heart-healthy fats", "Plant-based protein"],
  },
  {
    slug: "roasted-cashews",
    name: "Roasted Cashews",
    tagline: "Whole, golden, lightly salted",
    price: 22,
    rating: 4.8,
    reviews: 942,
    image: cashews,
    category: "Cashews",
    description:
      "Plump whole cashews kissed with sea salt and roasted to a delicate amber. Buttery, creamy, irresistibly clean.",
    benefits: ["Magnesium-rich", "Energy boosting", "Naturally creamy"],
  },
  {
    slug: "iranian-pistachios",
    name: "Iranian Pistachios",
    tagline: "Vivid green, naturally cracked",
    price: 28,
    rating: 4.9,
    reviews: 1631,
    image: pistachios,
    category: "Pistachios",
    description:
      "Sourced from the Kerman highlands, these pistachios are renowned for their jewel-green kernels and complex sweetness.",
    benefits: ["Antioxidant-dense", "Plant protein", "Naturally sweet"],
  },
  {
    slug: "medjool-dates",
    name: "Medjool Dates",
    tagline: "Caramel-soft, jumbo grade",
    price: 18,
    rating: 4.9,
    reviews: 720,
    image: dates,
    category: "Dates",
    description:
      "Jumbo Medjools with a fudgy, caramel-like center. The most luxurious natural sweetener you'll ever taste.",
    benefits: ["Natural sweetener", "High in fiber", "Quick energy"],
  },
  {
    slug: "gourmet-trail-mix",
    name: "Gourmet Trail Mix",
    tagline: "Berries, dark cacao, nuts",
    price: 26,
    rating: 4.7,
    reviews: 506,
    image: trailmix,
    category: "Trail Mix",
    description:
      "A balanced composition of mixed nuts, tart cranberries, sun-dried blueberries and 70% cacao chunks.",
    benefits: ["Trail-ready energy", "Antioxidants", "Balanced nutrition"],
  },
  {
    slug: "honey-roasted-nuts",
    name: "Honey Roasted Nuts",
    tagline: "Wildflower honey glaze",
    price: 25,
    rating: 4.8,
    reviews: 612,
    image: honey,
    category: "Healthy Snacks",
    description:
      "Slow-glazed in raw wildflower honey and finished with a whisper of sea salt — gourmet snacking redefined.",
    benefits: ["Lightly sweetened", "Crunchy texture", "All natural"],
  },
];

export const categories = [
  { name: "Almonds", image: almonds, slug: "almonds" },
  { name: "Cashews", image: cashews, slug: "cashews" },
  { name: "Pistachios", image: pistachios, slug: "pistachios" },
  { name: "Dates", image: dates, slug: "dates" },
  { name: "Trail Mixes", image: trailmix, slug: "trail-mixes" },
  { name: "Healthy Snacks", image: honey, slug: "snacks" },
];
