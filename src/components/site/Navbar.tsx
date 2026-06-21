// src/components/site/Navbar.tsx
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { api } from "@/services/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getPublicCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true);
        try {
          const results = await api.getAllProducts({ search: searchQuery });
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setSearchQuery("");
      navigate("/shop?search=" + encodeURIComponent(searchQuery));
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setShowCategoriesDropdown(false);
    navigate("/shop?category=" + encodeURIComponent(categoryName));
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${scrolled ? "py-2" : "py-5"}`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-700 ${scrolled ? "glass rounded-full py-2.5 shadow-card" : "py-3"
            }`}
          style={scrolled ? { marginInline: "1rem" } : undefined}
        >
          <Link to="/" className="font-display text-xl tracking-[0.22em] text-gradient-gold">
            Snacks Delight
          </Link>

          <nav className="hidden items-center gap-9 text-[13px] uppercase tracking-[0.18em] text-muted-foreground lg:flex">
            {links.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className="group relative transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}

            {/* Categories Dropdown */}
            {categories.length > 0 && (
              <div
                className="relative"
                onMouseEnter={() => setShowCategoriesDropdown(true)}
                onMouseLeave={() => setShowCategoriesDropdown(false)}
              >
                <button className="group relative flex items-center gap-1 transition-colors hover:text-foreground">
                  Categories
                  <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
                </button>

                {showCategoriesDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-xl glass-card py-2 shadow-lg animate-in fade-in-0 zoom-in-95">
                    {categories.map((category) => (
                      <button
                        key={category._id}
                        onClick={() => handleCategoryClick(category.name)}
                        className="block w-full px-4 py-2 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-1 text-foreground/80">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2.5 transition hover:bg-secondary hover:text-gold"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/admin" className="hidden rounded-full p-2.5 transition hover:bg-secondary hover:text-gold sm:inline-flex" aria-label="Admin">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link to="/cart" className="relative rounded-full p-2.5 transition hover:bg-secondary hover:text-gold" aria-label="Cart">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-medium text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="ml-1 rounded-full p-2.5 transition hover:bg-secondary lg:hidden"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <div className={`lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`fixed inset-x-4 top-20 origin-top rounded-3xl glass p-6 transition-all duration-500 max-h-[calc(100vh-6rem)] overflow-y-auto ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
          >
            <nav className="flex flex-col gap-1 text-base uppercase tracking-[0.2em]">
              {links.map((l, i) => (
                <Link
                  key={i}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-4 transition hover:bg-secondary touch-target"
                >
                  {l.label}
                </Link>
              ))}

              {/* Mobile Categories */}
              {categories.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs text-gold">Categories</div>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/shop?category=${category.name}`}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-4 py-3 pl-8 text-sm transition hover:bg-secondary"
                    >
                      {category.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="fixed top-20 left-1/2 w-full max-w-2xl -translate-x-1/2 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="glass-card rounded-2xl overflow-hidden">
              <form onSubmit={handleSearch} className="p-4 border-b border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for almonds, pistachios, dates..."
                    className="flex-1 bg-transparent px-4 py-3 outline-none"
                    autoFocus
                  />
                  <button type="submit" className="bg-gold text-primary-foreground px-6 py-2 rounded-full">
                    Search
                  </button>
                </div>
              </form>

              {isSearching && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Searching...</p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.slug}
                      to={`/product/${product.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition"
                    >
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length > 0 && searchResults.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}