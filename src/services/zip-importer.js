/**
 * Zip Import Handler
 * Handles zip file uploads and extraction for analysis
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class ZipImporter {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'zippyaudit-imports');
  }

  /**
   * Initialize temp directory
   */
  async initialize() {
    await fs.ensureDir(this.tempDir);
  }

  /**
   * Import zip file
   */
  async importZip(zipPath, projectName) {
    await this.initialize();

    const projectDir = path.join(this.tempDir, projectName || `project-${Date.now()}`);
    await fs.ensureDir(projectDir);

    try {
      // Extract zip file
      await this.extractZip(zipPath, projectDir);

      // Validate extracted content
      const validation = await this.validateProject(projectDir);
      
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid project structure');
      }

      return {
        success: true,
        projectPath: projectDir,
        projectName: projectName || path.basename(projectDir),
        fileCount: validation.fileCount,
        hasCode: validation.hasCode
      };
    } catch (error) {
      // Cleanup on error
      await fs.remove(projectDir);
      throw error;
    }
  }

  /**
   * Extract zip file
   */
  async extractZip(zipPath, destination) {
    // Try to use Node.js built-in or system commands
    if (process.platform === 'win32') {
      // Windows: Use PowerShell Expand-Archive
      const command = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destination}' -Force"`;
      await execAsync(command);
    } else {
      // Unix/Linux/Mac: Use unzip
      const command = `unzip -q "${zipPath}" -d "${destination}"`;
      await execAsync(command);
    }
  }

  /**
   * Validate project structure
   */
  async validateProject(projectPath) {
    try {
      const files = await this.getFiles(projectPath);
      
      if (files.length === 0) {
        return { valid: false, error: 'No files found in archive' };
      }

      // Check for code files
      const codeExtensions = ['.js', '.ts', '.py', '.go', '.java', '.rb', '.php', '.c', '.cpp', '.cs'];
      const hasCode = files.some(file => 
        codeExtensions.includes(path.extname(file).toLowerCase())
      );

      if (!hasCode) {
        return { valid: false, error: 'No source code files found' };
      }

      // Check if all files are in a single root folder
      const rootFolder = await this.detectRootFolder(projectPath);
      if (rootFolder) {
        // Move contents up one level
        await this.flattenStructure(projectPath, rootFolder);
      }

      return {
        valid: true,
        fileCount: files.length,
        hasCode: true
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get all files in directory
   */
  async getFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return this.getFiles(fullPath);
      } else {
        return fullPath;
      }
    }));
    return files.flat();
  }

  /**
   * Detect if all content is in a single root folder
   */
  async detectRootFolder(projectPath) {
    const entries = await fs.readdir(projectPath);
    
    // If there's only one entry and it's a directory, that's the root folder
    if (entries.length === 1) {
      const singleEntry = path.join(projectPath, entries[0]);
      const stat = await fs.stat(singleEntry);
      if (stat.isDirectory()) {
        return entries[0];
      }
    }

    return null;
  }

  /**
   * Flatten structure (move contents from subfolder to parent)
   */
  async flattenStructure(projectPath, rootFolder) {
    const rootPath = path.join(projectPath, rootFolder);
    const tempPath = path.join(projectPath, '_temp_' + Date.now());

    // Move root folder to temp location
    await fs.move(rootPath, tempPath);

    // Move all contents from temp to project root
    const entries = await fs.readdir(tempPath);
    for (const entry of entries) {
      await fs.move(
        path.join(tempPath, entry),
        path.join(projectPath, entry)
      );
    }

    // Remove temp directory
    await fs.remove(tempPath);
  }

  /**
   * Get export guide for various platforms
   */
  getExportGuide(platform) {
    const guides = {
      bolt: {
        name: 'Bolt.new',
        steps: [
          'Click on the "Export" button in the top right',
          'Select "Download as ZIP"',
          'Save the file to your computer',
          'Upload the ZIP file here'
        ],
        note: 'Bolt exports include all your project files in a single archive'
      },
      loveable: {
        name: 'Loveable.dev',
        steps: [
          'Click on "Project Settings"',
          'Find the "Export Project" option',
          'Choose "Download ZIP"',
          'Save the exported file',
          'Upload here to analyze'
        ],
        note: 'Exported projects include source code and configuration'
      },
      manus: {
        name: 'Manus',
        steps: [
          'Open your project',
          'Click "File" → "Export Project"',
          'Select destination and click "Export"',
          'Locate the ZIP file',
          'Upload it here'
        ],
        note: 'Manus exports are optimized for easy portability'
      },
      leap: {
        name: 'Leap',
        steps: [
          'Go to Project menu',
          'Select "Export as Archive"',
          'Choose ZIP format',
          'Download the archive',
          'Upload here for audit'
        ],
        note: 'Leap archives include all project assets'
      },
      vscode: {
        name: 'VS Code / Any IDE',
        steps: [
          'Select your project folder in file explorer',
          'Right-click and choose "Send to → Compressed folder" (Windows)',
          'or "Compress" (Mac)',
          'Upload the created ZIP file here'
        ],
        note: 'Works with any project on your computer'
      }
    };

    return guides[platform] || guides.vscode;
  }

  /**
   * Cleanup old imports
   */
  async cleanup(olderThanDays = 1) {
    try {
      const entries = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = olderThanDays * 24 * 60 * 60 * 1000;

      for (const entry of entries) {
        const entryPath = path.join(this.tempDir, entry);
        const stat = await fs.stat(entryPath);
        
        if (now - stat.mtimeMs > maxAge) {
          await fs.remove(entryPath);
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  }

  /**
   * Get storage info
   */
  async getStorageInfo() {
    try {
      const entries = await fs.readdir(this.tempDir);
      let totalSize = 0;
      
      for (const entry of entries) {
        const entryPath = path.join(this.tempDir, entry);
        const stat = await fs.stat(entryPath);
        totalSize += stat.size;
      }

      return {
        projectCount: entries.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      return { projectCount: 0, totalSize: 0, totalSizeMB: '0.00' };
    }
  }
}

module.exports = ZipImporter;

