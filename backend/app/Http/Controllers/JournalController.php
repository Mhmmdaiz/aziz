<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index()
    {
        // Mengambil data terbaru dengan path image yang bersih
        $data = Journal::latest()->get(); 
        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    public function show($slug)
    {
        // Mencari berdasarkan slug untuk detail page
        $journal = Journal::where('slug', $slug)->first();

        if (!$journal) {
            return response()->json(['message' => 'Journal not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $journal
        ]);
    }
}