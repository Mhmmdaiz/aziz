<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone'    => 'required|string',
            'city'     => 'required|string',
            'address'  => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'city'     => $request->city,
            'address'  => $request->address,
            'role'     => 'user', 
        ]);

        // OPSIONAL: Langsung kasih token setelah register biar user langsung login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Identity Created Successfully',
            'token'   => $token,
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid Credentials'], 401);
        }

        // Hapus token lama biar database nggak penuh (Opsional tapi bagus buat security)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Access Granted',
            'token'   => $token,
            'user'    => $user 
        ]);
    }

    // TAMBAHKAN INI: Fungsi Logout buat bersihin token di database
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}