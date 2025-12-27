"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog'
import axios from 'axios'
import HistoryTable from './HistoryTable'
import { SessionDetail } from '../medical-agent/[sessionId]/page'
function HistoryList() {
    const [historyList,setHistoryList]=useState<SessionDetail[]>([])
    useEffect(() => {
      GetHistoryList();
    }, []);

    const GetHistoryList=async()=>{
      const result=await axios.get('/api/session-chat?sessionId=all');
      console.log(result.data);
      setHistoryList(result.data);
      
    }

  return (
    <div className='mt-10'>
      {historyList.length===0?
       <div className='flex items-center flex-col justify-center p-7 border border-dashed rounded-2xl border-gray-300 '>
         <Image src="/medicalassistance.svg" alt="empty history" width={150} height={150} />
         <h2 className='font-bold text-xl mt-5'>No Recent Consultation</h2>
         <p>It looks like you haven't had any consultations yet.</p>
        <AddNewSessionDialog />
       </div>:
       <div><HistoryTable historyList={historyList} /></div>

    }

    </div>
  )
}

export default HistoryList
