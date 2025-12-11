'use client';

import React, { useState, useEffect } from 'react';
import { Building, ChevronDown, Search, Plus, X } from 'lucide-react';
import { getBranches, BranchHierarchy } from '../services/branchService';

interface BranchSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  showCreateOption?: boolean;
  onCreateNew?: () => void;
}

const BranchSelect: React.FC<BranchSelectProps> = ({
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "Select branch",
  showCreateOption = false,
  onCreateNew
}) => {
  const [branches, setBranches] = useState<BranchHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        console.log('BranchSelect: Starting to fetch branches...');
        const data = await getBranches();
        console.log('BranchSelect: Fetched branches data:', data);
        console.log('BranchSelect: Data type:', typeof data);
        console.log('BranchSelect: Is array?', Array.isArray(data));
        console.log('BranchSelect: Length:', data?.length || 0);
        setBranches(data || []);
        console.log('BranchSelect: Set branches state');
      } catch (error) {
        console.error('BranchSelect: Failed to fetch branches:', error);
        setBranches([]);
      } finally {
        setLoading(false);
        console.log('BranchSelect: Set loading to false');
      }
    };

    fetchBranches();
  }, []);

  // Flatten hierarchy for display with indentation
  const getFlattenedBranches = () => {
    const flattened: Array<{ branch: BranchHierarchy; indent: number }> = [];

    const flatten = (branchList: BranchHierarchy[], indent = 0) => {
      branchList.forEach(branch => {
        flattened.push({ branch, indent });
        if (branch.children) {
          flatten(branch.children, indent + 1);
        }
      });
    };

    flatten(branches);
    return flattened;
  };

  const flattenedBranches = getFlattenedBranches();
  const filteredBranches = flattenedBranches.filter(
    ({ branch }) => branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = flattenedBranches.find(({ branch }) => branch.code === value);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Building className="h-5 w-5 text-gray-400" />
      </div>

      <div
        className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm cursor-pointer bg-slate-700 text-white ${
          error ? 'border-red-300' : 'border-slate-600'
        } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={selectedBranch ? 'text-white' : 'text-slate-400'}>
            {selectedBranch ? selectedBranch.branch.fullPath : (loading ? 'Loading branches...' : placeholder)}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base border border-slate-600 overflow-auto">
          {/* Search input */}
          <div className="px-3 py-2 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-sm border border-slate-600 rounded bg-slate-700 text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Branch options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredBranches.map(({ branch, indent }) => (
              <div
                key={branch.code}
                className="px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center text-white"
                style={{ paddingLeft: `${12 + indent * 16}px` }}
                onClick={() => {
                  onChange(branch.code);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <span className="text-sm">{branch.name}</span>
                <span className="text-xs text-slate-400 ml-2">({branch.code})</span>
              </div>
            ))}
          </div>

          {/* Create new option */}
          {showCreateOption && (
            <div className="border-t border-slate-700">
              <div
                className="px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center text-blue-400"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew?.();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm">Create New Branch</span>
              </div>
            </div>
          )}

          {filteredBranches.length === 0 && !loading && (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">
              No branches found
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default BranchSelect;