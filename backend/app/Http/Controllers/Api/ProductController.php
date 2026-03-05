<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage; // WAJIB TAMBAHKAN INI
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Exception; // Tambahkan ini di atas

class ProductController extends Controller
{
    // 1. Menampilkan semua produk dengan relasi images
    public function index(Request $request)
    {
        $search = $request->query('search');
        $products = Product::with('images') 
            ->when($search, function($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                             ->orWhere('description', 'like', "%{$search}%");
            })->latest()->paginate(10);

        return response()->json(['success' => true, 'data' => $products], 200);
    }

    // 2. Simpan produk baru
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required',
            'price'       => 'required|numeric',
            'stock'       => 'required|integer',
            'images'      => 'required', 
            'images.*'    => 'image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $product = Product::create([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
            'category_id' => 1,
            'slug'        => Str::slug($request->name),
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Product Created!'], 201);
    }

    // 3. Detail Produk (Digunakan oleh Page Edit Next.js)
    public function show($id)
    {
        $product = Product::with('images')->find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Not Found'], 404);
        }
        return response()->json(['success' => true, 'data' => $product], 200);
    }

    // 4. Update Produk
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name'        => 'required',
            'price'       => 'required|numeric',
            'stock'       => 'required|numeric',
            'images.*'    => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $product->update([
            'name'        => $request->name,
            'description' => $request->description,
            'price'       => $request->price,
            'stock'       => $request->stock,
            'slug'        => Str::slug($request->name),
        ]);

        // Upload gambar baru jika ada (ditambahkan ke koleksi yang sudah ada)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Product Updated!']);
    }

    // 5. Hapus Produk & Semua Gambarnya
    public function destroy($id)
{
    try {
        $product = Product::with('images')->findOrFail($id);

        // Hapus file fisik dari storage/app/public
        foreach ($product->images as $img) {
            \Storage::disk('public')->delete($img->image_path);
        }

        $product->delete(); // Ini akan menghapus produk & relasi images (jika pakai cascade)

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted from archive'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Server Error: ' . $e->getMessage()
        ], 500);
    }
}

    // 6. Hapus Foto Satuan (Triggered by Tombol X di Next.js)
    public function deleteImage($id) 
    {
        $image = ProductImage::find($id);
        if ($image) {
            // Hapus file dari folder storage/app/public/products
            Storage::disk('public')->delete($image->image_path);
            // Hapus record di DB
            $image->delete();
            return response()->json(['success' => true, 'message' => 'Foto dihapus dari server']);
        }
        return response()->json(['success' => false, 'message' => 'Foto tidak ditemukan'], 404);
    }
}