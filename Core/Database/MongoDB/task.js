------------- MongoDB queries -----------

1. Write a query to find all movies that share at least one cast member with "Blacksmith Scene."

db.movies.find({ cast: { $in: db.movies.findOne({ title: "Blacksmith Scene" }).cast } })


2. Write a query to find the top 5 movies with the highest IMDb ratings that were released before the year 1900.

db.movies.aggregate([ {$match: {"year" : { $lt: 1900 }  }},  {$sort: {"imdb.rating": -1 }  }  ])


3. Write a query to find all movies directed by "William K.L. Dickson." Return the titles, release years, and IMDb ratings of the movies.

db.movies.aggregate([ {$match: {directors : "William K.L. Dickson" }}, {$project: { title: 1, author: 1, "imdb.rating": 1, directors: 1, _id: 0}}])


4. Write an aggregation query to find the top 3 directors who have directed the most movies in the "Short" genre. Return the directors' names and the number of movies.

db.movies.aggregate([{$match: {genres: "Short" }}, { $unwind: "$directors"  }, {$group: {_id: "$directors", movieCount: {$sum: 1 }} }, {$sort: {movieCount: -1}} , {$limit :3}, {$project:{director: "$_id", movieCount: 1  }  }] )



6. Write an aggregation query to find the pair of actors who have appeared together in the most number of movies. Return their names and the number of movies they've co-starred in.

db.movies.aggregate([    
    {
    $match: {
      "cast": {
      $exists: true
      }

    }
    },

    {
      $project: {
        castPairs: {
          $reduce: {
            input: { $range: [0, { $subtract: [{ $size: "$cast" }, 1] }] },
            initialValue: [],
            in: {
              $concatArrays: [
                "$$value",
                {
                  $map: {
                    input: { $slice: ["$cast", { $add: ["$$this", 1] }, { $size: "$cast" }] },
                    as: "pairActor",
                    in: [{ $arrayElemAt: ["$cast", "$$this"] }, "$$pairActor"]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $unwind: "$castPairs"
    },
    {
      $project: {
        actorPair: {
          $let: {
            vars: {
              first: { $arrayElemAt: ["$castPairs", 0] },
              second: { $arrayElemAt: ["$castPairs", 1] }
            },
            in: {
              $cond: { if: { $lt: ["$$first", "$$second"] }, then: ["$$first", "$$second"], else: ["$$second", "$$first"] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: "$actorPair",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])