"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const menuOptions = [
  { id: 1, name: 'Home', path: '/dashboard' },
  { id: 2, name: 'History', path: '/dashboard/history' },
  { id: 3, name: 'Pricing', path: '/dashboard/billing' },
];

function AppHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b shadow-md px-10 md:px-20 lg:px-40">
      <Image src="/logo3.png" alt="Logo" width={180} height={90} />

      <div className="hidden md:flex gap-12 items-center">
        {menuOptions.map(option => (
          <Link
            key={option.id}
            href={option.path}
            className="hover:font-bold transition-all"
          >
            {option.name}
          </Link>
        ))}
      </div>

      <UserButton />
    </div>
  );
}

export default AppHeader;
