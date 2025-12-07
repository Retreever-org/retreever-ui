// hooks/useAppInitializer.ts
import { useEffect } from 'react'
import { useApiHealthStore } from '../stores/api-state-store'
import { useDocStore } from '../stores/doc-store'
import { docStorage } from '../storage/doc-storage'
import { getRetreeverDoc } from '../api/services/get-retreever-doc'
import { ping } from '../api/services/ping'
import { getSidebarCollections } from '../services/sidebar-collections'
import type { RetreeverDoc } from '../types/response.types'

export const useAppInitializer = () => {
  const { setOnline, setOffline } = useApiHealthStore()
  const docStore = useDocStore()

  useEffect(() => {
    // Run only ONCE on mount
    let aborted = false

    const controller = new AbortController()
    
    const initialize = async () => {
      docStore.setInitializing(true)

      try {
        const cachedDoc = await docStorage.getDoc()
        
        if (cachedDoc && !aborted) {
          docStore.setDoc(cachedDoc)
          docStore.setCollections(getSidebarCollections(cachedDoc))
          
          // Background validation
          validateCache(cachedDoc, controller.signal).catch(console.error)
        } else if (!aborted) {
          const doc = await getRetreeverDoc()
          await docStorage.saveDoc(doc)
          docStore.setDoc(doc)
          docStore.setCollections(getSidebarCollections(doc))
          console.log("setting online!");
          setOnline()
        }
      } catch (error) {
        if (aborted) return
        
        console.error('App initialization failed:', error)
        const cachedDoc = await docStorage.getDoc()
        if (cachedDoc) {
          docStore.setDoc(cachedDoc)
          docStore.setCollections(getSidebarCollections(cachedDoc))
          console.log("setting online!");
          setOnline()
        } else {
          setOffline()
        }
      } finally {
        if (!aborted) {
          docStore.setInitializing(false)
        }
      }
    }

    initialize()

    return () => {
      aborted = true
      controller.abort()
    }
  }, []) // EMPTY deps = runs ONCE
}

const validateCache = async (cachedDoc: RetreeverDoc, signal: AbortSignal) => {
  try {
    const pingResponse = await ping()
    if (signal.aborted) return
    
    console.log("setting online!");
    useApiHealthStore.getState().setOnline()
    
    if (cachedDoc.up_time !== pingResponse.uptime) {
      const freshDoc = await getRetreeverDoc()
      await docStorage.saveDoc(freshDoc)
      useDocStore.getState().setDoc(freshDoc)
      useDocStore.getState().setCollections(getSidebarCollections(freshDoc))
    }
  } catch (error: any) {
    if (error.name === 'AbortError') return
    if (!signal.aborted) {
      useApiHealthStore.getState().setOffline()
      console.warn('Cache validation failed:', error)
    }
  }
}
