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
    <div style={{ marginLeft: level * 16 }}>
      <div
        className={cn(
          'flex items-center gap-1 pl-2 pr-4 py-1 rounded cursor-pointer',
          isDir ? 'hover:bg-muted/60' : 'text-muted-foreground'
        )}
        onClick={() => isDir && setOpen((v) => !v)}
      >
        {isDir ? (
          open ? (
            <ChevronDownIcon />
          ) : (
            <ChevronRightIcon />
          )
        ) : (
          <FileIcon className="text-blue-500" />
        )}
        {isDir ? (
          <FolderIcon className="text-yellow-600" />
        ) : (
          <FileIcon className="text-blue-500" />
        )}
        <span className={cn(isDir ? 'font-medium' : '')}>{node.name}</span>
        {node.extension && !isDir && (
          <span className="text-xs ml-2 text-muted-foreground">
            {node.extension}
          </span>
        )}
        {!isDir && (
          <span className="ml-auto text-xs text-muted-foreground">
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
    <div className="bg-muted p-4 rounded-lg shadow-sm border">
      <div className="font-semibold mb-2 text-lg">File Structure</div>
      <FileNode node={fileStructure} />
    </div>
  );
}
