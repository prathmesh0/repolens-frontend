'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
} from 'lucide-react';

// Data type that should match your fileStructure
type FileNodeType = {
  type: 'file' | 'dir';
  name: string;
  extension?: string;
  size?: number;
  children?: FileNodeType[];
};

// One liner utility for styling; replace with your own ShadCN if you prefer
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Recursive file/directory node
function FileNode({ node, level = 0 }: { node: FileNodeType; level?: number }) {
  const [open, setOpen] = React.useState(level < 2); // Open first two levels by default
  const isDir = node.type === 'dir';

  return (
    <div style={{ marginLeft: level * 12 }}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-md pl-1 sm:pl-2 pr-2 sm:pr-3 py-1.5 text-sm transition-colors duration-150',
          isDir
            ? 'cursor-pointer hover:bg-muted'
            : 'cursor-default text-muted-foreground hover:bg-muted/50'
        )}
        onClick={() => isDir && setOpen((v) => !v)}
      >
        {isDir ? (
          open ? (
            <ChevronDownIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          )
        ) : (
          <FileIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        )}
        {isDir ? (
          <FolderIcon className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
        ) : (
          <FileIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        )}
        <span
          className={cn(isDir ? 'font-medium text-foreground' : '', 'truncate')}
        >
          {node.name}
        </span>
        {node.extension && !isDir && (
          <span className="ml-1 hidden font-mono text-xs text-muted-foreground sm:ml-2 sm:inline">
            {node.extension}
          </span>
        )}
        {!isDir && (
          <span className="ml-auto hidden flex-shrink-0 font-mono text-xs text-muted-foreground md:inline">
            {node.size} bytes
          </span>
        )}
      </div>
      {isDir && node.children && node.children.length > 0 && (
        <motion.div
          initial={false}
          animate={open ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, height: 'auto' },
            closed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          {node.children.map((child, i) => (
            <FileNode node={child} level={level + 1} key={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Main component to use in your chat UI
export default function FileTree({
  fileStructure,
}: {
  fileStructure: FileNodeType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <FolderIcon className="h-3.5 w-3.5 text-primary" />
        File Structure
      </div>
      <div className="custom-scrollbar max-h-[420px] overflow-auto">
        <FileNode node={fileStructure} />
      </div>
    </div>
  );
}
