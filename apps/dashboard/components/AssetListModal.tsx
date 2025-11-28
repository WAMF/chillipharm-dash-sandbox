'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import type { AssetRecord } from '@cp/types';
import { useDashboard } from '../contexts/DashboardContext';

const PAGE_SIZE = 25;

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

export function AssetListModal() {
  const {
    showAssetList,
    setShowAssetList,
    assetListTitle,
    assetListRecords,
    setSelectedAsset
  } = useDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof AssetRecord>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleClose = useCallback(() => {
    setShowAssetList(false);
  }, [setShowAssetList]);

  useEffect(() => {
    if (!showAssetList) {
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [showAssetList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && showAssetList) {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [showAssetList, handleClose]);

  const filteredAssets = useMemo(() => {
    return assetListRecords.filter(asset => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        asset.assetTitle?.toLowerCase().includes(term) ||
        asset.siteName?.toLowerCase().includes(term) ||
        asset.subjectNumber?.toLowerCase().includes(term) ||
        asset.uploadedBy?.toLowerCase().includes(term) ||
        asset.studyProcedure?.toLowerCase().includes(term)
      );
    });
  }, [assetListRecords, searchTerm]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredAssets, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedAssets.length / PAGE_SIZE);
  const paginatedAssets = sortedAssets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleRowClick = useCallback((asset: AssetRecord) => {
    setSelectedAsset(asset);
  }, [setSelectedAsset]);

  const handleViewAsset = useCallback((event: React.MouseEvent, asset: AssetRecord) => {
    event.stopPropagation();
    if (asset.assetLink) {
      window.open(asset.assetLink, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleSort = useCallback((field: keyof AssetRecord) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const exportToCsv = useCallback(() => {
    const headers = [
      'Asset Title', 'Site Name', 'Site Country', 'Subject Number', 'Study Arm',
      'Study Event', 'Study Procedure', 'Procedure Date', 'Upload Date', 'Uploaded By',
      'Duration', 'File Size', 'Processed', 'Reviewed', 'Reviewed By', 'Review Date', 'Comments'
    ];

    const rows = sortedAssets.map(asset => [
      asset.assetTitle || '',
      asset.siteName || '',
      asset.siteCountry || '',
      asset.subjectNumber || '',
      asset.studyArm || '',
      asset.studyEvent || '',
      asset.studyProcedure || '',
      asset.studyProcedureDate || '',
      asset.uploadDate ? format(typeof asset.uploadDate === 'string' ? parseISO(asset.uploadDate) : asset.uploadDate, 'yyyy-MM-dd HH:mm:ss') : '',
      asset.uploadedBy || '',
      asset.assetDuration || '',
      asset.fileSize || '',
      asset.processed || '',
      asset.reviewed ? 'Yes' : 'No',
      asset.reviewedBy || '',
      asset.reviewedDate || '',
      (asset.comments || '').replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const sanitizedTitle = assetListTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const timestamp = format(new Date(), 'yyyy-MM-dd');

    link.setAttribute('href', url);
    link.setAttribute('download', `${sanitizedTitle}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sortedAssets, assetListTitle]);

  if (!showAssetList) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-modal-title"
    >
      <div
        className="bg-white rounded-lg w-full max-w-[1000px] max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-5 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
          <div className="flex-1">
            <h2 id="list-modal-title" className="text-lg font-semibold text-neutral-800">
              {assetListTitle}
            </h2>
            <span className="text-xs text-neutral-500 mt-1 block">
              {filteredAssets.length} record{filteredAssets.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            className="text-neutral-500 hover:text-neutral-700 text-3xl leading-none ml-4"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-4 border-b border-neutral-100 bg-white flex justify-between items-center gap-4">
          <div className="relative max-w-[300px] flex-1">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-md text-sm focus:outline-none focus:border-chilli-red focus:ring-2 focus:ring-chilli-red/10"
            />
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xl leading-none"
                onClick={() => setSearchTerm('')}
              >
                &times;
              </button>
            )}
          </div>
          <button
            className="px-4 py-2 bg-chilli-red text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            onClick={exportToCsv}
            disabled={sortedAssets.length === 0}
          >
            Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {paginatedAssets.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-neutral-500">
              No assets found{searchTerm ? ' matching your search' : ''}
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-neutral-50 z-10">
                  <tr>
                    <th
                      className="text-left py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200 cursor-pointer hover:text-chilli-red whitespace-nowrap"
                      onClick={() => handleSort('assetTitle')}
                    >
                      Asset
                      {sortField === 'assetTitle' && (
                        <span className="text-[0.625rem] ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200 cursor-pointer hover:text-chilli-red whitespace-nowrap"
                      onClick={() => handleSort('siteName')}
                    >
                      Site
                      {sortField === 'siteName' && (
                        <span className="text-[0.625rem] ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200 cursor-pointer hover:text-chilli-red whitespace-nowrap"
                      onClick={() => handleSort('subjectNumber')}
                    >
                      Subject
                      {sortField === 'subjectNumber' && (
                        <span className="text-[0.625rem] ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th
                      className="text-left py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200 cursor-pointer hover:text-chilli-red whitespace-nowrap"
                      onClick={() => handleSort('uploadDate')}
                    >
                      Upload Date
                      {sortField === 'uploadDate' && (
                        <span className="text-[0.625rem] ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200 whitespace-nowrap">
                      Status
                    </th>
                    <th className="w-[60px] text-center py-3 px-4 font-semibold text-neutral-600 border-b border-neutral-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.map((asset) => (
                    <tr
                      key={asset.assetId}
                      className="cursor-pointer hover:bg-neutral-50"
                      onClick={() => handleRowClick(asset)}
                    >
                      <td className="py-3 px-4 border-b border-neutral-100 text-neutral-700">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-neutral-800">{asset.assetTitle || '-'}</span>
                          {asset.studyProcedure && (
                            <span className="text-xs text-neutral-500">{asset.studyProcedure}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-neutral-100 text-neutral-700">
                        {asset.siteName || '-'}
                      </td>
                      <td className="py-3 px-4 border-b border-neutral-100 text-neutral-700">
                        {asset.subjectNumber || '-'}
                      </td>
                      <td className="py-3 px-4 border-b border-neutral-100 text-neutral-700">
                        {formatDate(asset.uploadDate)}
                      </td>
                      <td className="py-3 px-4 border-b border-neutral-100">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          asset.reviewed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {asset.reviewed ? 'Reviewed' : 'Pending'}
                        </span>
                      </td>
                      <td className="w-[60px] text-center py-3 px-4 border-b border-neutral-100">
                        {asset.assetLink && (
                          <button
                            className="px-2 py-1 bg-chilli-red text-white rounded text-sm hover:bg-red-700"
                            onClick={(e) => handleViewAsset(e, asset)}
                            title="View Asset"
                          >
                            ↗
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 px-6 border-t border-neutral-100 bg-white">
            <button
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="text-xs text-neutral-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 p-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
          <button
            className="px-5 py-2.5 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
