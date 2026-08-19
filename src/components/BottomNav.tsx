import { NavLink, useLocation } from "react-router-dom";
import { Home, TrendingUp, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

const items = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/oportunidades", key: "nav.opportunities", icon: TrendingUp },
  { to: "/invertir", key: "nav.invest", icon: Wallet },
  { to: "/contact", key: "nav.contact", icon: User },
];

const BottomNav = () => {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("nav.aria")}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
        {items.map(({ to, key, icon: Icon }) => {
          const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 px-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    active ? "bg-foreground text-background" : "bg-transparent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.6} />
                </span>
                <span>{t(key)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
