import DAL from '@/components/DAL'
import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
  return (
    <DAL redirect={{ role: "customer", href: "/customer" }}>
    {children}
    </DAL>
  )
}

export default layout