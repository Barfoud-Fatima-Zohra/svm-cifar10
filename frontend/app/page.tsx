"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, CheckCircle2, ImageIcon, Sparkles, TrendingUp, Upload } from "lucide-react"
import { useRef, useState } from "react"

const CIFAR_CLASSES = [
  { name: "airplane", icon: "✈️" },
  { name: "automobile", icon: "🚗" },
  { name: "bird", icon: "🐦" },
  { name: "cat", icon: "🐱" },
  { name: "deer", icon: "🦌" },
  { name: "dog", icon: "🐕" },
  { name: "frog", icon: "🐸" },
  { name: "horse", icon: "🐴" },
  { name: "ship", icon: "⛵" },
  { name: "truck", icon: "🚚" },
]

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [prediction, setPrediction] = useState<{ class: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPrediction(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handlePredict = async () => {

    if (!selectedFile) {
      alert("Please select an image first.")
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
      const res = await fetch(`${apiBase}/predict`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      console.log("Response from API : ", data.prediction)
      if (res.ok && data.prediction) {
        setPrediction({
          class: data.prediction,
        })
      }
      else {
        setError(data.error || "Unexpected response from server.")
      }

    } catch (error) {
      setError("Network error.")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="gradient-glow fixed inset-x-0 top-0 h-[500px] pointer-events-none" />


      <header className="relative border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">CIFAR-10 Classifier</h1>
              <p className="text-xs text-muted-foreground">Powered by SVM</p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>AI Model</span>
          </Badge>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Image Classification with SVM
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Téléchargez une image pour prédire sa classe parmi les 10 catégories CIFAR-10 à l'aide de notre modèle de
            machine à vecteurs de support.
          </p>
        </div>

        {/* Upload card */}
        <Card className="card-glow bg-card border-border/50 p-8 mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              }`}
          >
            <input ref={fileInputRef} type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileInput} />

            {preview ? (
              <div className="p-8">
                <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden border border-border">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <Button
                    
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      fileInputRef.current?.click()
                    }}
                  >
                    Changer l'image
                  </Button>
                  <Button className="gap-2" size="lg" onClick={handlePredict}>
                    <Sparkles className="w-4 h-4" />
                    Prédire la classe
                  </Button>
                </div>
              </div>
            ) : (
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-16 cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">Glisser-déposer votre image ici</p>
                <p className="text-sm text-muted-foreground mb-4">ou cliquez pour parcourir vos fichiers</p>
                <Badge variant="secondary" className="gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  PNG, JPG, JPEG
                </Badge>
              </label>
            )}
          </div>
        </Card>

        {prediction && (
          <Card className="card-glow bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Résultat
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    Classe prédite:{" "}
                    <span className="text-primary capitalize">
                      {prediction.class} {CIFAR_CLASSES.find((c) => c.name === prediction.class)?.icon}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Le modèle SVM a analysé votre image avec succès</p>
                </div>

              </div>
            </div>
          </Card>
        )}

        {/* Classes grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Supported classes
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CIFAR_CLASSES.map((item) => (
              <Card
                key={item.name}
                className="bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-200 p-4 text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-foreground capitalize">{item.name}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Info section */}
        <Card className="bg-secondary/30 border-border/50 p-6 mt-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">About the model</h4>
              <p className="text-sm text-muted-foreground text-pretty">
                Ce classificateur utilise une machine à vecteurs de support (SVM) entraînée sur le jeu de données
                CIFAR-10, capable de reconnaître 10 catégories d'objets avec une grande précision.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
