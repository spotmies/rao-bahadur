"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Trash2, GripVertical, Upload, Film, BarChart3, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useUploadThing, uploadFiles } from "@/lib/uploadthing";

type DynamicImage = {
  id: string;
  category: string;
  src: string;
  order: number;
};

type Video = {
  id: string;
  title: string;
  src: string;
  poster: string | null;
  order: number;
};

export default function AdminUpdateCountPage() {
  const { startUpload } = useUploadThing("videoUploader", {
    onUploadProgress: (p) => {
      setUploadProgress(50 + (p / 2));
      setUploadMessage(`Uploading: ${Math.round(p)}%`);
    },
  });

  const [activeTab, setActiveTab] = useState<"stats" | "videos" | "tweets" | "letterbox" | "critics">("stats");

  // Images State
  const [images, setImages] = useState<DynamicImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"TWEETS" | "LETTERBOX" | "CRITICS">("TWEETS");
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState("");
  const [hasUnsavedImageChanges, setHasUnsavedImageChanges] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savingImageOrder, setSavingImageOrder] = useState(false);

  // Counters State
  const [count, setCount] = useState<number | "">("");
  const [sales, setSales] = useState<number | "">("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingStats, setSavingStats] = useState(false);
  const [statsMessage, setStatsMessage] = useState("");

  // Videos State
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const dragItemIndexRef = useRef<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // FFmpeg State
  const ffmpegRef = useRef<any>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);

  useEffect(() => {
    // Load Stats
    fetch('/api/counter')
      .then(res => res.json())
      .then(data => {
        if (data.count) setCount(data.count);
        if (data.sales) setSales(data.sales);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingStats(false);
      });

    // Load Videos
    fetchVideos();
    
    // Load Images
    fetchImages();

    // Load FFmpeg
    loadFfmpeg();
  }, []);

  const loadFfmpeg = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('progress', ({ progress, time }: { progress: number; time: number }) => {
      setUploadMessage(`Compressing: ${Math.round(progress * 100)}%`);
      setUploadProgress(progress * 50); // Compression is first 50%
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setIsFfmpegLoaded(true);
    } catch (e) {
      console.error("FFmpeg failed to load", e);
    }
  };

  const toBlobURL = async (url: string, mimeType: string) => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: mimeType });
    return URL.createObjectURL(blob);
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVideos(data);
      }
      setLoadingVideos(false);
    } catch (err) {
      console.error(err);
      setLoadingVideos(false);
    }
  };

  const fetchImages = async (category = selectedCategory) => {
    setLoadingImages(true);
    try {
      const res = await fetch(`/api/admin/images?category=${category}`);
      const data = await res.json();
      if (Array.isArray(data)) setImages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchImages(selectedCategory);
  }, [selectedCategory]);

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStats(true);
    setStatsMessage("");

    try {
      const res = await fetch('/api/admin/counter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: typeof count === 'number' ? count : parseInt(count as string, 10),
          sales: typeof sales === 'number' ? sales : parseInt(sales as string, 10),
        })
      });

      if (res.ok) {
        setStatsMessage("Successfully updated counters.");
      } else {
        setStatsMessage("Failed to update counters.");
      }
    } catch (err) {
      console.error(err);
      setStatsMessage("An error occurred.");
    } finally {
      setSavingStats(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newVideoFile) return;

    if (!newTitle) {
      alert("Please enter a video title before uploading.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage("Preparing upload...");

    try {
      let fileToUpload: File | Blob = newVideoFile;

      // 100MB limit for raw upload
      if (newVideoFile.size > 100 * 1024 * 1024) {
        if (!isFfmpegLoaded) {
          alert("File is too large and FFmpeg is not loaded yet. Please wait a moment and try again.");
          setUploading(false);
          return;
        }

        setUploadMessage("Compressing large video...");
        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile(newVideoFile.name, await fetchFile(newVideoFile));

        // Compress to 720p, 24fps to save space
        await ffmpeg.exec(['-i', newVideoFile.name, '-vf', 'scale=-2:720', '-r', '24', '-vcodec', 'libx264', '-crf', '28', '-preset', 'ultrafast', 'output.mp4']);

        const data = await ffmpeg.readFile('output.mp4');
        fileToUpload = new Blob([data as any], { type: 'video/mp4' });
      }

      let posterUrl = null;
      if (newPosterFile) {
        setUploadMessage("Uploading thumbnail...");
        const posterRes = await uploadFiles("imageUploader", { files: [newPosterFile] });
        if (posterRes && posterRes.length > 0) {
          posterUrl = posterRes[0].url;
        }
      }

      setUploadMessage("Uploading video to UploadThing...");
      setUploadProgress(50); // Set to 50% starting upload phase

      const finalFile = new File([fileToUpload], newVideoFile.name, { type: 'video/mp4' });
      const utRes = await startUpload([finalFile]);

      if (!utRes || utRes.length === 0) {
        throw new Error("Upload failed");
      }

      const secureUrl = utRes[0].url;

      setUploadMessage("Saving to database...");

      // Save to database
      await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          src: secureUrl,
          poster: posterUrl,
        }),
      });

      setNewTitle("");
      setNewVideoFile(null);
      setNewPosterFile(null);
      await fetchVideos();
      setUploadMessage("Upload complete!");

      setTimeout(() => {
        setUploadMessage("");
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      console.error(err);
      setUploadMessage(`Error: ${err instanceof Error ? err.message : 'Upload failed'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await fetch(`/api/admin/videos?id=${id}`, { method: 'DELETE' });
      await fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === videos.length - 1) return;

    const newVideos = [...videos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap
    const temp = newVideos[index];
    newVideos[index] = newVideos[swapIndex];
    newVideos[swapIndex] = temp;

    setVideos(newVideos);
    setHasUnsavedChanges(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    const updatedItems = videos.map((v, i) => ({ ...v, order: i }));

    try {
      await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reorder: true,
          items: updatedItems.map(v => ({ id: v.id, order: v.order }))
        })
      });
      setVideos(updatedItems);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save order");
      await fetchVideos();
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItemIndexRef.current = index;
    setDraggedItemIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", e.currentTarget.innerHTML);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const dragIndex = dragItemIndexRef.current;
    if (dragIndex === null || dragIndex === index) return;

    setVideos(prev => {
      const newVideos = [...prev];
      const draggedItem = newVideos[dragIndex];
      newVideos.splice(dragIndex, 1);
      newVideos.splice(index, 0, draggedItem);
      return newVideos;
    });

    dragItemIndexRef.current = index;
    setDraggedItemIndex(index);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    dragItemIndexRef.current = null;
  };

  const handleImageDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const dragIndex = dragItemIndexRef.current;
    if (dragIndex === null || dragIndex === index) return;

    setImages(prev => {
      const newImages = [...prev];
      const draggedItem = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(index, 0, draggedItem);
      return newImages;
    });

    dragItemIndexRef.current = index;
    setDraggedItemIndex(index);
    setHasUnsavedImageChanges(true);
  };

  const handleImageUpload = async () => {
    if (newImageFiles.length === 0) return;
    setUploadingImage(true);
    setImageUploadMessage(`Uploading ${newImageFiles.length} image(s)...`);

    try {
      const res = await uploadFiles("imageUploader", { files: newImageFiles });
      if (!res || res.length === 0) throw new Error("Upload failed");
      
      setImageUploadMessage("Saving to database...");

      await Promise.all(res.map(r => 
        fetch('/api/admin/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedCategory, src: r.url }),
        })
      ));

      setNewImageFiles([]);
      await fetchImages(selectedCategory);
      setImageUploadMessage("Upload complete!");
      setTimeout(() => setImageUploadMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setImageUploadMessage("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await fetch(`/api/admin/images?id=${id}`, { method: 'DELETE' });
      await fetchImages(selectedCategory);
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;
    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newImages[index];
    newImages[index] = newImages[swapIndex];
    newImages[swapIndex] = temp;
    setImages(newImages);
    setHasUnsavedImageChanges(true);
  };

  const saveImageOrder = async () => {
    setSavingImageOrder(true);
    const updatedItems = images.map((img, i) => ({ ...img, order: i }));
    try {
      await fetch('/api/admin/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, items: updatedItems.map(v => ({ id: v.id, order: v.order })) })
      });
      setImages(updatedItems);
      setHasUnsavedImageChanges(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save order");
      await fetchImages(selectedCategory);
    } finally {
      setSavingImageOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 pt-24 md:pt-32 pb-24 md:pb-32">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-8 text-gradient-gold">Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-border/50 pb-2">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === "stats" ? "bg-primary/20 text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
          >
            <BarChart3 size={20} />
            <span>Statistics</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === "videos" ? "bg-primary/20 text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
          >
            <Film size={20} />
            <span>Celebrity Videos</span>
          </button>
          <button
            onClick={() => { setActiveTab("tweets"); setSelectedCategory("TWEETS"); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === "tweets" ? "bg-primary/20 text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
          >
            <ImageIcon size={20} />
            <span>Tweets</span>
          </button>
          <button
            onClick={() => { setActiveTab("letterbox"); setSelectedCategory("LETTERBOX"); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === "letterbox" ? "bg-primary/20 text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
          >
            <ImageIcon size={20} />
            <span>Letterbox</span>
          </button>
          <button
            onClick={() => { setActiveTab("critics"); setSelectedCategory("CRITICS"); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === "critics" ? "bg-primary/20 text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"}`}
          >
            <ImageIcon size={20} />
            <span>Critics</span>
          </button>
        </div>

        {activeTab === "stats" && (
          <div className="bg-card/20 backdrop-blur-md border border-primary/20 p-8 rounded-2xl shadow-xl max-w-xl">
            <h2 className="text-2xl font-serif mb-6">Update Counters</h2>
            {loadingStats ? (
              <div>Loading...</div>
            ) : (
              <form onSubmit={handleStatsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">People Entered (Count)</label>
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-background/50 border border-border/50 focus:border-primary/50 outline-none rounded-xl text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Tickets Sold (Sales)</label>
                  <input
                    type="number"
                    value={sales}
                    onChange={(e) => setSales(parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-background/50 border border-border/50 focus:border-primary/50 outline-none rounded-xl text-foreground"
                    required
                  />
                </div>
                <Button variant="regal" type="submit" disabled={savingStats} className="w-full py-6 rounded-xl mt-4">
                  {savingStats ? "Saving..." : "Update Values"}
                </Button>
                {statsMessage && <p className="text-center mt-4 text-sm text-primary">{statsMessage}</p>}
              </form>
            )}
          </div>
        )}

        {["tweets", "letterbox", "critics"].includes(activeTab) && (
          <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-md border border-primary/20 p-6 rounded-2xl shadow-xl flex flex-col gap-4">

              <div className="flex-1 relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setNewImageFiles(Array.from(e.target.files));
                    }
                  }}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <Button variant="outline" className={`w-full py-6 rounded-xl flex items-center justify-center space-x-2 ${newImageFiles.length > 0 ? 'border-primary text-primary' : ''}`} disabled={uploadingImage}>
                  <ImageIcon size={20} />
                  <span>{newImageFiles.length > 0 ? `${newImageFiles.length} Image(s) Selected` : "Select Images"}</span>
                </Button>
              </div>
              <Button
                variant="regal"
                className="w-full py-6 rounded-xl flex items-center justify-center space-x-2 mt-2"
                disabled={uploadingImage || newImageFiles.length === 0}
                onClick={handleImageUpload}
              >
                <Upload size={20} />
                <span>{uploadingImage ? "Uploading..." : "Upload New Images"}</span>
              </Button>
            </div>
            
            {imageUploadMessage && (
              <div className="bg-background/80 border border-primary/50 p-4 rounded-xl text-sm font-medium text-center">
                {imageUploadMessage}
              </div>
            )}

            <div className="bg-card/20 backdrop-blur-md border border-primary/20 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-border/20 bg-background/30 font-semibold flex items-center justify-between">
                <span>Manage {selectedCategory} ({images.length})</span>
                {hasUnsavedImageChanges && (
                  <Button onClick={saveImageOrder} disabled={savingImageOrder} className="h-8">
                    {savingImageOrder ? "Saving..." : "Save Order"}
                  </Button>
                )}
              </div>
              
              {loadingImages ? (
                <div className="p-8 text-center">Loading images...</div>
              ) : images.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">No images in this category yet.</div>
              ) : (
                <div className="divide-y divide-border/20">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleImageDragEnter(e, index)}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing ${draggedItemIndex === index ? 'opacity-50 border-2 border-dashed border-primary/50' : ''}`}
                    >
                      <div className="flex flex-col space-y-1">
                        <button onClick={() => moveImage(index, 'up')} disabled={index === 0} className="p-1 text-foreground/40 hover:text-primary disabled:opacity-30">▲</button>
                        <button onClick={() => moveImage(index, 'down')} disabled={index === images.length - 1} className="p-1 text-foreground/40 hover:text-primary disabled:opacity-30">▼</button>
                      </div>
                      <div className="w-24 h-16 bg-black rounded-md overflow-hidden relative flex-shrink-0 border border-border/50">
                        <img src={img.src} alt="Upload" className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage(img.src)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/50 truncate">{img.src}</p>
                      </div>
                      <button onClick={() => handleDeleteImage(img.id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div className="space-y-8">
            <div className="bg-card/20 backdrop-blur-md border border-primary/20 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium mb-2 text-foreground/80">New Video Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Sukumar"
                  className="w-full p-3 bg-background/50 border border-border/50 focus:border-primary/50 outline-none rounded-xl text-foreground"
                  disabled={uploading}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setNewPosterFile(e.target.files[0])}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <Button variant="outline" className={`w-full py-6 rounded-xl flex items-center justify-center space-x-2 ${newPosterFile ? 'border-primary text-primary' : ''}`} disabled={uploading}>
                    <ImageIcon size={20} />
                    <span>{newPosterFile ? newPosterFile.name : "Select Thumbnail Image"}</span>
                  </Button>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={(e) => e.target.files && setNewVideoFile(e.target.files[0])}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <Button variant="outline" className={`w-full py-6 rounded-xl flex items-center justify-center space-x-2 ${newVideoFile ? 'border-primary text-primary' : ''}`} disabled={uploading}>
                    <Film size={20} />
                    <span>{newVideoFile ? newVideoFile.name : "Select Video File"}</span>
                  </Button>
                </div>
              </div>
              <Button
                variant="regal"
                className="w-full py-6 rounded-xl flex items-center justify-center space-x-2 mt-2"
                disabled={uploading || !newTitle || !newVideoFile}
                onClick={handleFileUpload}
              >
                <Upload size={20} />
                <span>{uploading ? "Uploading..." : "Upload New Video"}</span>
              </Button>
            </div>

            {uploadMessage && (
              <div className="bg-background/80 border border-primary/50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{uploadMessage}</span>
                  <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {!isFfmpegLoaded && (
              <div className="flex items-center space-x-2 text-yellow-500 text-sm">
                <AlertCircle size={16} />
                <span>Loading compression engine... Large uploads will fail until this completes.</span>
              </div>
            )}

            <div className="bg-card/20 backdrop-blur-md border border-primary/20 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-border/20 bg-background/30 font-semibold flex items-center justify-between">
                <span>Manage Videos ({videos.length})</span>
                {hasUnsavedChanges ? (
                  <Button onClick={saveOrder} disabled={savingOrder} className="h-8">
                    {savingOrder ? "Saving..." : "Save Order"}
                  </Button>
                ) : (
                  <span className="text-sm text-foreground/60 font-normal">Drag or use arrows to reorder</span>
                )}
              </div>

              {loadingVideos ? (
                <div className="p-8 text-center">Loading videos...</div>
              ) : videos.length === 0 ? (
                <div className="p-8 text-center text-foreground/50">No videos uploaded yet.</div>
              ) : (
                <div className="divide-y divide-border/20">
                  {videos.map((video, index) => (
                    <div
                      key={video.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                      className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-grab active:cursor-grabbing ${draggedItemIndex === index ? 'opacity-50 border-2 border-dashed border-primary/50' : ''}`}
                    >
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveVideo(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-foreground/40 hover:text-primary disabled:opacity-30 transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveVideo(index, 'down')}
                          disabled={index === videos.length - 1}
                          className="p-1 text-foreground/40 hover:text-primary disabled:opacity-30 transition-colors"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="w-24 h-16 bg-black rounded-md overflow-hidden relative flex-shrink-0 border border-border/50">
                        {video.poster ? (
                          <img src={video.poster} alt={video.title} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage(video.poster!)} />
                        ) : (
                          <img src={video.src.replace('.mp4', '.jpg')} alt={video.title} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage(video.src.replace('.mp4', '.jpg'))} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{video.title}</h4>
                        <p className="text-xs text-foreground/50 truncate">{video.src}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
