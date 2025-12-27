import { AIDoctorAgents } from '@/shared/list'
import { index } from 'drizzle-orm/gel-core'
import React from 'react'
import DoctorAgentCard from './DoctorAgentCard'

function DoctorsAgentList() {
  return (
    <div className='mt-10 p-6 border rounded-lg shadow-sm'>
      <h2 className='font-bold text-xl'>AI Agentic Doctors Available</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full items-center'>
        {AIDoctorAgents.map((doctor,index)=>(
          <div key={index} className='flex items-center gap-4 mt-5 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer'>
            <DoctorAgentCard doctorAgent={doctor} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsAgentList
