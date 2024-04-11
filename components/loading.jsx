import React from 'react'
import { RefreshCw } from "lucide-react";

export function Loading() {
  return (
    <div className='grid place-content-center h-full'><RefreshCw className="animate-spin" size={36}/></div>
  )
}
