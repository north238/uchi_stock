<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    /**
     * @var Genre $genres
     */
    protected $genres;

    public function __construct(Genre $genres)
    {
        $this->genres = $genres;
    }

    public function index()
    {
        $genres = $this->genres->getGenresWithRelations();

        return response()->json($genres);
    }
}
