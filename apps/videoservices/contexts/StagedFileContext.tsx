'use client';

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react';
import type { StagedFile } from '@cp/types';

interface StagedFileContextValue {
    stagedFile: StagedFile | null;
    stageFile: (file: File) => void;
    clearStagedFile: () => void;
    isStaged: boolean;
}

const StagedFileContext = createContext<StagedFileContextValue | undefined>(
    undefined
);

interface StagedFileProviderProps {
    children: ReactNode;
}

export function StagedFileProvider({ children }: StagedFileProviderProps) {
    const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);

    const stageFile = useCallback((file: File) => {
        setStagedFile({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
        });
    }, []);

    const clearStagedFile = useCallback(() => {
        setStagedFile(null);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (stagedFile) {
                e.preventDefault();
                e.returnValue =
                    'You have a staged file that will be lost. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [stagedFile]);

    const value: StagedFileContextValue = {
        stagedFile,
        stageFile,
        clearStagedFile,
        isStaged: stagedFile !== null,
    };

    return (
        <StagedFileContext.Provider value={value}>
            {children}
        </StagedFileContext.Provider>
    );
}

export function useStagedFile(): StagedFileContextValue {
    const context = useContext(StagedFileContext);
    if (context === undefined) {
        throw new Error(
            'useStagedFile must be used within a StagedFileProvider'
        );
    }
    return context;
}
