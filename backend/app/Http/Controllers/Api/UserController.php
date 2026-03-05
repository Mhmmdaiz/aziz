<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search != '') {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('role') && $request->role != 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->get(); // Pakai get() jika di frontend tidak handle pagination, atau paginate(10)

        return response()->json([
            'data' => $users,
            'meta' => [
                'stats' => [
                    'total' => User::count(),
                    'active' => User::where('status', 'active')->count(),
                    'suspended' => User::where('status', 'suspended')->count(),
                    'growth' => '+5%', 
                ]
            ]
        ]);
    }

    // 1. TAMBAHKAN FUNGSI STORE (Untuk Add New User)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'required|in:admin,customer,staff',
        ]);

        // Default password jika tidak input password di form admin
        $validated['password'] = Hash::make('password123'); 
        $validated['status'] = 'active';

        $user = User::create($validated);

        return response()->json(['message' => 'User created successfully', 'data' => $user], 201);
    }

    // 2. TAMBAHKAN FUNGSI UPDATE (Untuk Edit Profile)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'required',
        ]);

        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'data' => $user]);
    }

    // 3. TAMBAHKAN FUNGSI DESTROY (Untuk Delete User)
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => $request->status]);

        return response()->json(['message' => 'User status updated successfully']);
    }
}