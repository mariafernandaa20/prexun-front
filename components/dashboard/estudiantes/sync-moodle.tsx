'use client'
import { Button } from '@/components/ui/button'
import axiosInstance from '@/lib/api/axiosConfig'
import React from 'react'

export default function SyncMoodle() {

    const handleSyncMoodle = async () => {
        const response = await axiosInstance.post('/students/sync-module')

        console.log(response)
    }




    return (
        <Button onClick={() => handleSyncMoodle()}>
            Sync Moodle
        </Button>
    )
}
