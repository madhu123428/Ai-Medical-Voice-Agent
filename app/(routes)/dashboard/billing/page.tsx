import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Billing() {
  return (
    <div className='px-10 md:px-20 lg:px-40'>
        <h2 className='font-bold text-3xl mb-10'>Join Subscription</h2>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <PricingTable />
    </div>
    </div>
  )
}

export default Billing
