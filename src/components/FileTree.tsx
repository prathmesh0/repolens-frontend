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
          'flex items-center gap-1 pl-1 sm:pl-2 pr-2 sm:pr-4 py-1 cursor-pointer',
          isDir ? 'hover:bg-muted/60' : 'text-muted-foreground'
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
        <span className={cn(isDir ? 'font-medium' : '', 'truncate')}>
          {node.name}
        </span>
        {node.extension && !isDir && (
          <span className="text-xs ml-1 sm:ml-2 text-muted-foreground hidden sm:inline">
            {node.extension}
          </span>
        )}
        {!isDir && (
          <span className="ml-auto text-xs text-muted-foreground hidden md:inline flex-shrink-0">
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
    <div className="p-3 sm:p-4">
      <div className="font-semibold mb-2 text-sm sm:text-base md:text-lg">
        📂 File Structure
      </div>
      <FileNode node={fileStructure} />
    </div>
  );
}
