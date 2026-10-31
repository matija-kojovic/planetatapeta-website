"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductSlider({ products }) {
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Scroll logic for EXACTLY 4 items at a time
  const scroll = useCallback((direction) => {
    if (scrollContainerRef.current) {
      // clientWidth is the visible width. Since we styled cards to fit exactly 4 in the container width,
      // moving by clientWidth effectively moves exactly 4 cards on desktop.
      const { clientWidth, scrollLeft, scrollWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth; 
      
      let newScroll = scrollLeft + (direction === 'next' ? scrollAmount : -scrollAmount);
      
      // Loop back or forward logic
      if (newScroll >= scrollWidth - 10) newScroll = 0; // -10 threshold for rounding
      if (newScroll < 0) newScroll = scrollWidth - clientWidth;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }, []);

  // Autoplay Reel
  useEffect(() => {
    if (isHovered || isDragging) return;
    const intervalId = setInterval(() => {
      scroll('next');
    }, 4000); // 4 seconds interval for reel
    return () => clearInterval(intervalId);
  }, [isHovered, isDragging, scroll]);

  // Mouse Drag Logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCardClick = (e, product) => {
    // Prevent click if we were dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }

    let url = `/product/${product.productId || product.id}`;

    if (product.itemId === "tapete" && product.imageSrc) {
      url = `/product/tapeta?img=${encodeURIComponent(product.imageSrc)}&title=${encodeURIComponent(product.title)}`;
    } else if (product.itemId === "slike_na_platnu" && product.imageSrc) {
      url = `/product/slika-na-platnu?img=${encodeURIComponent(product.imageSrc)}&title=${encodeURIComponent(product.title)}`;
    } else if (product.itemId === "zidni_stikeri" && product.imageSrc) {
      url = `/product/stiker?img=${encodeURIComponent(product.imageSrc)}&title=${encodeURIComponent(product.title)}`;
    }

    router.push(url);
  };

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Side Navigation Arrows (Fade in on hover of slider) */}
      <button 
        onClick={() => scroll('prev')}
        className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-teal-500/80 backdrop-blur-md border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl opacity-0 translate-x-4 group-hover/slider:opacity-100 group-hover/slider:translate-x-0 transition-all duration-300"
        aria-label="Prethodni proizvodi"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={() => scroll('next')}
        className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-teal-500/80 backdrop-blur-md border border-white/20 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl opacity-0 -translate-x-4 group-hover/slider:opacity-100 group-hover/slider:translate-x-0 transition-all duration-300"
        aria-label="Sledeći proizvodi"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 
        The Scroll Container.
        Removed horizontal padding (px-...) here so that 100% width is purely allocatable to cards.
        Gap is 1.5rem (gap-6).
      */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-12 pt-8 hide-scrollbars no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div 
            onClick={(e) => handleCardClick(e, product)}
            key={product.id}
            className="group relative h-[300px] w-full sm:w-[calc((100%-1.5rem)/2)] lg:min-w-[calc((100%-4.5rem)/4)] lg:w-[calc((100%-4.5rem)/4)] snap-start shrink-0 rounded-xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 bg-slate-950 border border-white/10 shadow-lg hover:shadow-[0_15px_30px_-10px_rgba(212,163,115,0.25)] hover:border-amber-500/40 text-left select-none cursor-pointer"
          >
            {/* Background Image of the product */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 z-0" 
              style={{ backgroundImage: `url(${product.imageSrc || '/logoZaSajt.jpeg'})` }}
            />
            {/* Dark gradient overlay for typography readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 z-[1] transition-opacity duration-300 group-hover:opacity-95" />
            
            <div className="relative z-10 flex justify-end items-start w-full">
              <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all shrink-0">
                <svg className="w-4 h-4 text-gray-300 group-hover:text-amber-300 -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col mt-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-gray-300 text-[11px] line-clamp-2 leading-relaxed font-light">
                  {product.desc || "Premium kvalitet i štampa po meri za Vaš enterijer."}
                </p>
              </div>
              <div className="text-amber-400 font-bold mt-2.5 text-sm flex items-center gap-1">
                {product.price.toLocaleString('sr-RS')} RSD 
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
