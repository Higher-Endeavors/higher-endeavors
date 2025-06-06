//Core
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

//Components


// Dependencies
import { FaUserCircle, FaSignOutAlt, FaTasks, FaEnvelope, FaBook, FaProjectDiagram, FaChevronDown, FaChevronLeft, FaCog, FaIdBadge, FaChevronRight, FaHeartbeat, FaAppleAlt, FaTachometerAlt, FaListUl, FaUtensils, FaBars } from 'react-icons/fa';
import { MdSelfImprovement, MdDashboard } from 'react-icons/md';
import { GiMuscleUp } from 'react-icons/gi';

function useClickAway(ref: React.RefObject<HTMLDivElement | null>, onClickAway: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickAway();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClickAway]);
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
}

export default function UserSidebar() {
  const { data: session } = useSession();
  const firstName = session?.user?.first_name ?? null;
  const lastName = session?.user?.last_name ?? null;
  const fullName = session?.user?.name ?? "User name";
  const emailAddress = session?.user?.email ?? "Email address";
  let initials = "";
  if (firstName && lastName) {
    initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (fullName) {
    initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  const [expanded, setExpanded] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [fitnessOpen, setFitnessOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  // Only use click-away to collapse on desktop (so mobile doesn't collapse on any click)
  useClickAway(sidebarRef, () => {
    if (!isDesktop) setExpanded(false);
  });

  // Desktop: expand on hover, collapse on mouse leave
  const handleMouseEnter = () => {
    if (isDesktop) setExpanded(true);
  };
  const handleMouseLeave = () => {
    if (isDesktop) setExpanded(false);
  };

  // Mobile: toggle on click
  const handleMobileToggle = () => {
    if (!isDesktop) setExpanded((prev) => !prev);
  };

  return (
    <>
      {/* Hamburger menu button (mobile only, when sidebar is closed) */}
      {!expanded && !isDesktop && (
        <button
          className="fixed top-4 left-4 z-40 p-2 rounded bg-primary text-white md:hidden"
          onClick={() => setExpanded(true)}
          aria-label="Open sidebar"
        >
          <FaBars className="w-6 h-6" />
        </button>
      )}
      {/* Mobile Backdrop */}
      {expanded && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        ref={sidebarRef}
        className={`
          fixed z-30 top-0 left-0 h-screen bg-white dark:bg-[#232221] shadow-lg flex flex-col border-r border-slate-200 dark:border-slate-800
          transition-transform duration-200
          ${expanded ? 'w-60' : 'w-60 md:w-16'}
          ${expanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:static
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drawer handle (mobile only, inside sidebar) */}
        <button
          className="absolute top-4 -right-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md md:hidden"
          onClick={handleMobileToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{ display: expanded ? 'flex' : 'none' }}
        >
          <FaChevronLeft />
        </button>
        {/* Profile section */}
        <div className="flex flex-col items-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-400 flex items-center justify-center text-white text-xl font-bold mb-2">
            {initials || <FaUserCircle className="w-8 h-8" />}
          </div>
          {expanded && (
            <>
              <div className="font-bold text-lg text-slate-900 dark:text-white">John Smith</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">name@company.com</div>
              <div className="flex gap-2 mb-2">
                <Link href="/user/settings">
                  <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="User Settings">
                    <FaCog className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                  </button>
                </Link>
                <Link href="/user/bio">
                  <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="User Bio">
                    <FaIdBadge className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                  </button>
                </Link>
              </div>
              <button className="flex items-center justify-center gap-2 px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 mb-2">
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          <Link href="/user/dashboard">
            <SidebarLink expanded={expanded} icon={<MdDashboard />} label="Dashboard" />
          </Link>
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          <SidebarLink expanded={expanded} icon={<FaBook />} label="Guide to Your Ideal Self" />
          {expanded && (
            <>
              <Link href="/guide/table-of-contents">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={<FaListUl />} label="Table of Contents" isSubLink />
                </div>
              </Link>
              <Link href="/guide/recipes">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={<FaUtensils />} label="Recipes" isSubLink />
                </div>
              </Link>
            </>
          )}
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          <SidebarLink
            expanded={expanded}
            icon={<MdSelfImprovement />}
            label="Lifestyle"
            hasSubLinks
            open={lifestyleOpen}
            onClick={() => setLifestyleOpen((prev) => !prev)}
          />
          {lifestyleOpen && expanded && (
            <>
              <Link href="/tools/goal-tracker">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Goal Tracker" isSubLink />
                </div>
              </Link>
              <Link href="/tools/sleep-quiz">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Sleep Quality Assessment" isSubLink />
                </div>
              </Link>
            </>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<FaHeartbeat />}
            label="Health"
            hasSubLinks
            open={healthOpen}
            onClick={() => setHealthOpen((prev) => !prev)}
          />
          {healthOpen && expanded && (
            <Link href="/tools/body-composition">
              <div className="ml-8">
                <SidebarLink expanded={expanded} icon={null} label="Body Composition Tracker" isSubLink />
              </div>
            </Link>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<FaAppleAlt />}
            label="Nutrition"
            hasSubLinks
            open={nutritionOpen}
            onClick={() => setNutritionOpen((prev) => !prev)}
          />
          {nutritionOpen && expanded && (
            <Link href="/tools/nutrition-tracker">
              <div className="ml-8">
                <SidebarLink expanded={expanded} icon={null} label="Nutrition Tracker" isSubLink />
              </div>
            </Link>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<GiMuscleUp />}
            label="Fitness"
            hasSubLinks
            open={fitnessOpen}
            onClick={() => setFitnessOpen((prev) => !prev)}
          />
          {fitnessOpen && expanded && (
            <>
              <Link href="/tools/resistance-training">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Resistance Training" isSubLink />
                </div>
              </Link>
              <Link href="/tools/cardiometabolic-training">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Cardiometabolic Endurance Training" isSubLink />
                </div>
              </Link>
              <Link href="/tools/structural-balance">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Structural Balance" isSubLink />
                </div>
              </Link>
            </>
          )}
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          
          <Link href="/contact">
            <SidebarLink expanded={expanded} icon={<FaEnvelope />} label="Contact Us" />
          </Link>
        </nav>
        {/* Expand/collapse button (desktop) */}
        <button
          className="hidden md:flex items-center justify-center w-8 h-8 mt-4 mb-2 mx-auto rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <FaChevronLeft /> : <FaChevronDown />}
        </button>
      </div>
    </>
  );
}

type SidebarLinkProps = {
  expanded: boolean;
  icon: React.ReactNode;
  label: string;
  hasSubLinks?: boolean;
  open?: boolean;
  onClick?: () => void;
  isSubLink?: boolean;
  children?: React.ReactNode;
};

function SidebarLink({ expanded, icon, label, hasSubLinks, open, onClick, isSubLink, children }: SidebarLinkProps) {
  return (
    <div className={`flex flex-col ${isSubLink ? '' : 'px-2'}`}>
      <button
        className={`flex items-center gap-3 w-full px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSubLink ? 'text-xs pl-6' : 'text-base'} ${hasSubLinks ? 'justify-between' : ''}`}
        onClick={onClick}
        aria-expanded={!!open}
      >
        {icon && <span className="text-xl">{icon}</span>}
        {expanded && <span className="flex-1 text-left">{label}</span>}
        {hasSubLinks && expanded && (
          <span className="ml-auto">{open ? <FaChevronDown /> : <FaChevronLeft />}</span>
        )}
      </button>
      {children}
    </div>
  );
} 