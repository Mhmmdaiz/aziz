<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Ambil semua data untuk Admin & Landing Page
     */
    public function index()
    {
        // Tips: Untuk Landing Page biasanya hanya ambil yang 'published'
        // Tapi untuk Admin, ambil semua.
        $posts = Post::latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $posts
        ]);
    }

    /**
     * Simpan Journal Baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required',
            'category' => 'required',
            'status'   => 'required',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'title'    => $request->title,
            // Gunakan slug unik
            'slug'     => Str::slug($request->title) . '-' . Str::lower(Str::random(5)),
            'category' => $request->category,
            'content'  => $request->content,
            'status'   => $request->status,
            'image'    => $imagePath,
        ]);

        return response()->json([
            'message' => 'Narrative created successfully',
            'data'    => $post
        ], 201);
    }

    /**
     * FIX: Detail Post (Mendukung ID untuk Admin & SLUG untuk Public)
     */
    public function show($identifier)
    {
        // Cari berdasarkan slug ATAU id agar tidak 404 di Next.js
        $post = Post::where('slug', $identifier)
                    ->orWhere('id', $identifier)
                    ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => $post
        ]);
    }

    /**
     * Update Journal
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $request->validate([
            'title'    => 'required|string|max:255',
            'category' => 'required',
            'status'   => 'required',
            'content'  => 'nullable',
            'image'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        // Update slug HANYA jika title berubah (Opsional, tapi bagus untuk SEO)
        if ($post->title !== $request->title) {
            $post->slug = Str::slug($request->title) . '-' . Str::lower(Str::random(5));
        }

        $post->title = $request->title;
        $post->category = $request->category;
        $post->status = $request->status;

        if ($request->has('content')) {
            $post->content = $request->content;
        }

        if ($request->hasFile('image')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $post->image = $request->file('image')->store('posts', 'public');
        }

        $post->save();

        return response()->json([
            'message' => 'Synced Successfully',
            'data'    => $post
        ]);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        $post->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}