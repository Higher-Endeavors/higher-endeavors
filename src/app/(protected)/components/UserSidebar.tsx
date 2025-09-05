//Core
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

//Components


// Dependencies
import { FaUserCircle, FaSignOutAlt, FaTasks, FaEnvelope, FaBook, FaProjectDiagram, FaChevronDown, FaChevronLeft, FaCog, FaIdBadge, FaChevronRight, FaHeartbeat, FaAppleAlt, FaTachometerAlt, FaListUl, FaUtensils, FaBars, FaChartLine } from 'react-icons/fa';
import { MdSelfImprovement, MdDashboard } from 'react-icons/md';
import { GiMuscleUp } from 'react-icons/gi';
import { useUserSettings } from '@/app/context/UserSettingsContext';
import { clientLogger } from '@/app/lib/logging/logger.client';

// Pillar SVGs from Pillars.jsx (updated for dark mode)
const LifestyleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" height={22} width={22}><path d="M35.71666666666667 16.433333333333334a12.433333333333334 12.433333333333334 0 0 1 -1.2 -2.4166666666666665c0 -8.783333333333333 -8.116666666666667 -14.016666666666667 -15.950000000000001 -14.016666666666667a16.55 16.55 0 0 0 -16.666666666666668 16.76666666666667c0 5.833333333333334 2.1166666666666667 10.216666666666667 6.3 13.033333333333335a0.8 0.8 0 0 1 0.3666666666666667 0.6833333333333333v8.683333333333334a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 0.8333333333333334h16.666666666666668a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 -0.8333333333333334v-5a0.8333333333333334 0.8333333333333334 0 0 1 0.8333333333333334 -0.8333333333333334h2.5a4.166666666666667 4.166666666666667 0 0 0 4.166666666666667 -4.166666666666667v-3.3333333333333335a0.8333333333333334 0.8333333333333334 0 0 1 0.8333333333333334 -0.8333333333333334h0.9166666666666667a2.166666666666667 2.166666666666667 0 0 0 1.6666666666666667 -0.8666666666666667 2.1166666666666667 2.1166666666666667 0 0 0 0.3166666666666667 -1.25 12.833333333333334 12.833333333333334 0 0 0 -2.4166666666666665 -6.45Zm-11.666666666666668 0.21666666666666667a0.8 0.8 0 0 0 -0.75 0.3166666666666667 5.916666666666667 5.916666666666667 0 0 1 -3.966666666666667 2.166666666666667 0.8166666666666667 0.8166666666666667 0 0 0 -0.65 0.45000000000000007A6.666666666666667 6.666666666666667 0 0 1 12.733333333333333 23.333333333333336a6.8999999999999995 6.8999999999999995 0 0 1 -6.666666666666667 -7.083333333333334 7.2666666666666675 7.2666666666666675 0 0 1 2.4166666666666665 -5.45 0.9000000000000001 0.9000000000000001 0 0 0 0.26666666666666666 -0.43333333333333335A5.816666666666667 5.816666666666667 0 0 1 14.400000000000002 5.833333333333334a5.516666666666667 5.516666666666667 0 0 1 1.3833333333333333 0.16666666666666669 0.8333333333333334 0.8333333333333334 0 0 0 0.8833333333333334 -0.23333333333333336 5 5 0 0 1 3.6333333333333337 -1.6666666666666667 5 5 0 0 1 4.133333333333334 2.166666666666667A0.8500000000000001 0.8500000000000001 0 0 0 25 6.666666666666667a5 5 0 0 1 -1 10Z" fill="currentColor" strokeWidth={1} /></svg>
);
const HealthIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" height={22} width={22}><path fillRule="evenodd" clipRule="evenodd" d="M14.936216666666667 30.781166666666664C10.032383333333334 27.022833333333335 3.3333333333333335 20.814333333333334 3.3333333333333335 14.944216666666668 3.3333333333333335 5.1377 12.500266666666667 1.4764316666666666 20 9.051850000000002 27.49966666666667 1.4764316666666666 36.66666666666667 5.1377 36.66666666666667 14.944166666666668c0 5.870333333333334 -6.699000000000001 12.078666666666667 -11.602833333333335 15.837000000000002C22.843833333333336 32.48266666666667 21.733833333333333 33.333333333333336 20 33.333333333333336s-2.8438333333333334 -0.8506666666666667 -5.063783333333333 -2.552166666666667ZM27.5 10.416666666666668c0.6903333333333334 0 1.25 0.55965 1.25 1.25v2.0833666666666666h2.0833333333333335c0.6903333333333334 0 1.25 0.5596333333333334 1.25 1.25 0 0.69035 -0.5596666666666666 1.25 -1.25 1.25h-2.0833333333333335V18.333333333333336c0 0.6903333333333334 -0.5596666666666666 1.25 -1.25 1.25s-1.25 -0.5596666666666666 -1.25 -1.25V16.250033333333334l-2.0833333333333335 0c-0.6903333333333334 0 -1.25 -0.55965 -1.25 -1.25 0 -0.6903666666666667 0.5596666666666666 -1.25 1.25 -1.25h2.0833333333333335V11.666666666666668c0 -0.69035 0.5596666666666666 -1.25 1.25 -1.25Z" fill="currentColor" strokeWidth={1} /></svg>
);
const NutritionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-0.5 -0.5 40 40" height={22} width={22}><path fill="currentColor" d="M33.43981875 12.66614375c-1.4221187499999999 -2.4808874999999997 -3.61505625 -3.8702625 -6.517875 -4.13075 -1.53716875 -0.13715 -2.9706625 0.25666875 -4.35930625 0.6383 -1.07778125 0.29631875 -2.09616875 0.57581875 -3.06206875 0.57581875 -0.9658187500000001 0 -1.98046875 -0.28031249999999996 -3.051425 -0.57655 -1.39238125 -0.3809 -2.83196875 -0.78154375 -4.3745 -0.6368375000000001 -2.7718437500000004 0.25975624999999997 -4.989911875 1.68415 -6.421926875 4.119375 -1.323846875 2.25541875 -1.995670625 5.378425 -1.995670625 9.28135 0 3.0773437500000003 1.1425618750000002 6.8927625 3.046834375 10.20695 0.9765112499999999 1.69479375 3.5800131250000002 5.6366375 6.639075625 5.6366375 2.3437375 0 3.5914125 -0.7190625 4.50246875 -1.2438562499999999 0.63220625 -0.3641625 1.0138375 -0.58426875 1.6521374999999998 -0.58426875 0.6383 0 1.01993125 0.22010624999999998 1.6521374999999998 0.58426875 0.9140625 0.5247937500000001 2.1594625 1.2438562499999999 4.505475000000001 1.2438562499999999 3.05979375 0 5.66255625 -3.94265625 6.639100000000001 -5.6366375 1.9095375 -3.31345625 3.04679375 -7.128874999999999 3.04679375 -10.20695 0.0030875 -4.0042437500000005 -0.62001875 -7.036656250000001 -1.9012499999999999 -9.27070625ZM16.453775 26.81185c-1.0092875 0 -1.828125 -1.63694375 -1.828125 -3.65625s0.8188375 -3.65616875 1.828125 -3.65616875c1.00920625 0 1.8280437499999997 1.6368625 1.8280437499999997 3.65616875s-0.8188375 3.65625 -1.8280437499999997 3.65625Zm6.09366875 0c-1.0092875 0 -1.828125 -1.63694375 -1.828125 -3.65625s0.8188375 -3.65616875 1.828125 -3.65616875c1.00920625 0 1.8280437499999997 1.6368625 1.8280437499999997 3.65616875s-0.8188375 3.65625 -1.8280437499999997 3.65625Z" strokeWidth={1} /><path fill="currentColor" d="M20.1930625 8.525075c1.0023 -0.13325 2.88364375 -0.5963668750000001 4.480775 -2.192815625 1.1913687499999999 -1.19418 1.94309375 -2.7566825 2.13265 -4.432813125 0.0108875 -0.089464375 0.0017875 -0.180220625 -0.026731249999999998 -0.265728125 -0.028437500000000004 -0.0855075 -0.07548125 -0.16364562500000002 -0.1378 -0.22877562499999998 -0.062318750000000006 -0.06513 -0.13820625 -0.11562687499999999 -0.22238125 -0.14785875 -0.084175 -0.03224 -0.17444375 -0.0454025 -0.26430624999999996 -0.038553125 -0.96809375 0.072353125 -2.79979375 0.44708624999999996 -4.47321875 2.121201875 -1.2293937499999998 1.2082199999999998 -2.0007812499999997 2.806171875 -2.1821312500000003 4.520425 -0.00934375 0.09208875 0.0024375 0.185160625 0.0342875 0.27207375 0.0320125 0.08685625 0.08336249999999999 0.16534374999999998 0.15015 0.22945s0.14730625 0.112125 0.2354625 0.1404c0.08815625 0.02835625 0.18159375 0.03615625 0.27324375 0.02299375Z" strokeWidth={1} /></svg>
);
const FitnessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" height={22} width={22}><g><path d="M15.833333333333334 12.85a4.166666666666667 4.166666666666667 0 1 0 8.333333333333334 0 4.166666666666667 4.166666666666667 0 1 0 -8.333333333333334 0" fill="currentColor" strokeWidth={1} /><path d="m39.18333333333334 1.05 -3.3333333333333335 -0.55a0.8 0.8 0 0 0 -0.8500000000000001 0.6833333333333333l-0.3 1.6666666666666667a0.7833333333333333 0.7833333333333333 0 0 1 -0.3666666666666667 0.5666666666666668 0.8 0.8 0 0 1 -0.6666666666666667 0.1 54.81666666666667 54.81666666666667 0 0 0 -27.35 -0.3666666666666667 0.8500000000000001 0.8500000000000001 0 0 1 -1.0333333333333334 -0.6666666666666667L5 1.1833333333333333A0.8 0.8 0 0 0 4.116666666666667 0.5L0.8166666666666667 1.05a0.8333333333333334 0.8333333333333334 0 0 0 -0.6833333333333333 0.9666666666666667l1.6666666666666667 9.850000000000001a0.8500000000000001 0.8500000000000001 0 0 0 0.9666666666666667 0.6833333333333333l3.3333333333333335 -0.55A0.8500000000000001 0.8500000000000001 0 0 0 6.666666666666667 11.033333333333333l-0.55 -3.6166666666666667a0.8500000000000001 0.8500000000000001 0 0 1 0.6333333333333334 -0.95 51.38333333333333 51.38333333333333 0 0 1 26.45 0.45000000000000007 0.8500000000000001 0.8500000000000001 0 0 1 0.6 0.95L33.333333333333336 11.033333333333333a0.8500000000000001 0.8500000000000001 0 0 0 0.6833333333333333 0.9666666666666667l3.3333333333333335 0.55a0.8500000000000001 0.8500000000000001 0 0 0 0.9666666666666667 -0.6833333333333333l1.6666666666666667 -9.850000000000001a0.8333333333333334 0.8333333333333334 0 0 0 -0.8 -0.9666666666666667Z" fill="currentColor" strokeWidth={1} /><path d="M29.166666666666668 7.8500000000000005A2.0833333333333335 2.0833333333333335 0 0 0 27.083333333333336 10v2.5a7.083333333333334 7.083333333333334 0 0 1 -7.783333333333333 7.050000000000001 7.3 7.3 0 0 1 -6.383333333333334 -7.433333333333334V10a2.0833333333333335 2.0833333333333335 0 0 0 -4.166666666666667 0v2.0500000000000003A11.766666666666666 11.766666666666666 0 0 0 15 22.483333333333334v16.200000000000003a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 0.8333333333333334H18.333333333333336a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 -0.8333333333333334v-4.166666666666667a0.8333333333333334 0.8333333333333334 0 0 1 1.6666666666666667 0v4.166666666666667a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 0.8333333333333334h2.5a0.8333333333333334 0.8333333333333334 0 0 0 0.8333333333333334 -0.8333333333333334V22.5a11.266666666666667 11.266666666666667 0 0 0 6.25 -10V10a2.0833333333333335 2.0833333333333335 0 0 0 -2.0833333333333335 -2.1500000000000004Z" fill="currentColor" strokeWidth={1} /></g></svg>
);

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

type UserSidebarProps = {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UserSidebar({ expanded, setExpanded }: UserSidebarProps) {
  const { data: session } = useSession();
  const { userSettings } = useUserSettings();
  const sidebarExpandMode = userSettings?.general?.sidebarExpandMode || 'hover';
  const isAdmin = session?.user?.role === 'admin';
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
  const [tasksOpen, setTasksOpen] = useState(false);
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [fitnessOpen, setFitnessOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  // Logout handler function
  async function signOutHandler() {
    const cognitoClient = process.env.NEXT_PUBLIC_COGNITO_CLIENT;
    const cognitoAuthUrl = process.env.NEXT_PUBLIC_COGNITO_AUTH_URL;

    try {
      await fetch('/api/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'plain/text' },
      });
    } catch (error) {
      clientLogger.error('Error signing out', error);
      // Handle sign out error
    }

    window.open(`https://auth.higherendeavors.com/logout?client_id=${cognitoClient}&logout_uri=${cognitoAuthUrl}`, "_self");
  }

  // Only use click-away to collapse on desktop (so mobile doesn't collapse on any click)
  useClickAway(sidebarRef, () => {
    if (!isDesktop) setExpanded(false);
  });

  // Desktop: expand on hover, collapse on mouse leave (only if mode is 'hover')
  const handleMouseEnter = () => {
    if (isDesktop && sidebarExpandMode === 'hover') setExpanded(true);
  };
  const handleMouseLeave = () => {
    if (isDesktop && sidebarExpandMode === 'hover') setExpanded(false);
  };
  // Desktop: expand/collapse on click (only if mode is 'click')
  const handleAvatarClick = () => {
    if (isDesktop && sidebarExpandMode === 'click') {
      if (expanded) {
        setExpanded(false);
        // Close all sections when collapsing
        setLifestyleOpen(false);
        setHealthOpen(false);
        setNutritionOpen(false);
        setFitnessOpen(false);
      } else {
        setExpanded(true);
      }
    }
  };

  // New function: expand sidebar when clicking any icon in "click" mode
  const handleIconClick = (sectionName?: string) => {
    if (isDesktop && sidebarExpandMode === 'click' && !expanded) {
      setExpanded(true);
      
      // Also expand the clicked section if it has sublinks
      if (sectionName) {
        switch (sectionName) {
          case 'lifestyle':
            setLifestyleOpen(true);
            break;
          case 'health':
            setHealthOpen(true);
            break;
          case 'nutrition':
            setNutritionOpen(true);
            break;
          case 'fitness':
            setFitnessOpen(true);
            break;
        }
      }
    }
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
          className="fixed top-4 left-4 z-40 p-2 rounded bg-primary text-slate-700 dark:text-white md:hidden"
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
          fixed z-30 top-0 left-0 h-screen overflow-y-auto
          bg-white dark:bg-[#232221] shadow-lg flex flex-col border-r border-slate-200 dark:border-slate-800
          transition-transform duration-200
          ${expanded ? 'w-60' : 'w-60 md:w-16'}
          ${expanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Profile section */}
        <div className="flex flex-col items-center py-6">
          <div
            className="w-12 h-12 rounded-full bg-slate-400 flex items-center justify-center text-white text-xl font-bold mb-2 cursor-pointer select-none"
            onClick={handleAvatarClick}
            tabIndex={sidebarExpandMode === 'click' && isDesktop ? 0 : -1}
            aria-label={sidebarExpandMode === 'click' && isDesktop ? (expanded ? 'Collapse sidebar' : 'Expand sidebar') : undefined}
            role={sidebarExpandMode === 'click' && isDesktop ? 'button' : undefined}
            onKeyDown={e => {
              if (sidebarExpandMode === 'click' && isDesktop && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleAvatarClick();
              }
            }}
            style={{ outline: sidebarExpandMode === 'click' && isDesktop ? undefined : 'none' }}
          >
            {initials || <FaUserCircle className="w-8 h-8" />}
          </div>
          {expanded && (
            <>
              <div className="font-bold text-lg text-slate-900 dark:text-white">
                {firstName && lastName
                  ? `${firstName} ${lastName}`
                  : fullName || "User name"}
              </div>
              <div className="flex gap-2 mb-2">
                <Link href="/user/bio">
                  <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="User Bio">
                    <FaIdBadge className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                  </button>
                </Link>
                <Link href="/user/settings">
                  <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="User Settings">
                    <FaCog className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                  </button>
                </Link>
              </div>
              <button 
                className="flex items-center justify-center gap-2 px-3 py-1 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 mb-2"
                onClick={signOutHandler}
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          <Link href="/user/dashboard">
            <SidebarLink 
              expanded={expanded} 
              icon={<MdDashboard />} 
              label="Dashboard" 
            />
          </Link>
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          <SidebarLink 
            expanded={expanded} 
            icon={<FaBook />} 
            label="Guide to Your Ideal Self" 
            onIconClick={() => handleIconClick()}
          />
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
            
            icon={<LifestyleIcon />}

            label="Lifestyle"
            hasSubLinks
            open={lifestyleOpen}
            onClick={() => setLifestyleOpen((prev) => !prev)}
            onIconClick={() => handleIconClick('lifestyle')}
            sectionName="lifestyle"
          />
          {lifestyleOpen && expanded && (
            <>
              <Link href="/tools/lifestyle/goal-tracker">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Goal Tracker" isSubLink />
                </div>
              </Link>
              <Link href="/tools/health/sleep-quiz">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Sleep Quality Assessment" isSubLink />
                </div>
              </Link>
            </>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<HealthIcon />}
            label="Health"
            hasSubLinks
            open={healthOpen}
            onClick={() => setHealthOpen((prev) => !prev)}
            onIconClick={() => handleIconClick('health')}
            sectionName="health"
          />
          {healthOpen && expanded && (
            <>
            <Link href="/tools/health/breathing">
              <div className="ml-8">
                <SidebarLink expanded={expanded} icon={null} label="Breathing" isSubLink />
              </div>
            </Link>
            <Link href="/tools/health/body-composition">
              <div className="ml-8">
                <SidebarLink expanded={expanded} icon={null} label="Body Composition Tracker" isSubLink />
              </div>
            </Link>
            </>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<NutritionIcon />}
            label="Nutrition"
            hasSubLinks
            open={nutritionOpen}
            onClick={() => setNutritionOpen((prev) => !prev)}
            onIconClick={() => handleIconClick('nutrition')}
            sectionName="nutrition"
          />
          {nutritionOpen && expanded && (
            <Link href="/tools/nutrition/nutrition-tracker">
              <div className="ml-8">
                <SidebarLink expanded={expanded} icon={null} label="Nutrition Tracker" isSubLink />
              </div>
            </Link>
          )}
          <SidebarLink
            expanded={expanded}
            icon={<FitnessIcon />}
            label="Fitness"
            hasSubLinks
            open={fitnessOpen}
            onClick={() => setFitnessOpen((prev) => !prev)}
            onIconClick={() => handleIconClick('fitness')}
            sectionName="fitness"
          />
          {fitnessOpen && expanded && (
            <>
              <Link href="/tools/fitness/plan">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Fitness Planning" isSubLink />
                </div>
              </Link>
              <Link href="/tools/fitness/resistance-training">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Resistance Training" isSubLink />
                </div>
              </Link>
              <Link href="/tools/fitness/cardiometabolic-training">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Cardiometabolic Endurance Training" isSubLink />
                </div>
              </Link>
              <Link href="/tools/fitness/structural-balance">
                <div className="ml-8">
                  <SidebarLink expanded={expanded} icon={null} label="Structural Balance" isSubLink />
                </div>
              </Link>
            </>
          )}
          <div className="border-b border-slate-200 dark:border-slate-700 mx-4 my-2" />
          
          <Link href="/contact">
            <SidebarLink 
              expanded={expanded} 
              icon={<FaEnvelope />} 
              label="Contact Us" 
            />
          </Link>
        </nav>
        {/* Bottom expand/collapse button (desktop only) */}
        <div className="flex-1 flex flex-col justify-end">
          <button
            className="hidden md:flex items-center justify-center w-12 h-12 mb-4 mx-auto rounded-full bg-gray-400 text-white hover:bg-primary-dark transition-colors text-2xl shadow-lg"
            onClick={() => {
              if (expanded) {
                setExpanded(false);
                // Close all sections when collapsing
                setLifestyleOpen(false);
                setHealthOpen(false);
                setNutritionOpen(false);
                setFitnessOpen(false);
              } else {
                setExpanded(true);
              }
            }}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>
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
  onIconClick?: () => void;
  sectionName?: string;
};

function SidebarLink({ expanded, icon, label, hasSubLinks, open, onClick, isSubLink, children, onIconClick, sectionName }: SidebarLinkProps) {
  const { userSettings } = useUserSettings();
  const sidebarExpandMode = userSettings?.general?.sidebarExpandMode || 'hover';
  const isDesktop = useIsDesktop();
  
  return (
    <div className={`flex flex-col ${isSubLink ? '' : 'px-2'}`}>
      <button
        className={`flex items-center gap-3 w-full px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSubLink ? 'text-xs pl-6' : 'text-base'} ${hasSubLinks ? 'justify-between' : ''}`}
        onClick={onClick}
        aria-expanded={!!open}
      >
        {icon && (
          <span 
            className="text-xl text-slate-500 dark:text-slate-100"
            onClick={(e) => {
              if (onIconClick && isDesktop && sidebarExpandMode === 'click' && !expanded) {
                e.stopPropagation();
                onIconClick();
              }
            }}
            style={{ 
              cursor: (onIconClick && isDesktop && sidebarExpandMode === 'click' && !expanded) ? 'pointer' : 'default' 
            }}
          >
            {icon}
          </span>
        )}
        {expanded && <span className="flex-1 text-left">{label}</span>}
        {hasSubLinks && expanded && (
          <span className="ml-auto">{open ? <FaChevronDown /> : <FaChevronLeft />}</span>
        )}
      </button>
      {children}
    </div>
  );
} 