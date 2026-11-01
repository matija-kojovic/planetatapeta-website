// One icon family: 24px grid, 1.5px stroke, round joins. Decorative by default.
const Svg = ({ children, size = 20, title, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    focusable="false"
    {...props}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export const BagIcon = (p) => (
  <Svg {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Svg>
);

export const MenuIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MinusIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const ExpandIcon = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </Svg>
);

export const ChevronIcon = (p) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
    <path d="m4 6.5 8 6 8-6" />
  </Svg>
);

export const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const InstagramIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
  </Svg>
);

export const ChatIcon = (p) => (
  <Svg {...p}>
    <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z" />
  </Svg>
);

export const EditIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12.5h10L18 7M9 7V4.5h6V7" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Svg>
);

export const ArrowIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
