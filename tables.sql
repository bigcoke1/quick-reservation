CREATE TABLE "restaurants" (
	"name"	TEXT,
	"address"	TEXT,
	"minGuests"	INTEGER,
	"img"	TEXT,
	"cuisine"	TEXT,
	"capacity"	INTEGER,
	PRIMARY KEY("name")
)

CREATE TABLE "reviews" (
	"username"	TEXT,
	"restaurant"	TEXT,
	"rating"	INTEGER,
	"comment"	TEXT,
	"id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("username") REFERENCES "users"("username"),
	FOREIGN KEY("restaurant") REFERENCES "restaurants"("name")
)

CREATE TABLE "users" (
	"email"	TEXT,
	"username"	TEXT,
	"password"	TEXT,
	"history"	TEXT DEFAULT '[]',
	"phone"	INTEGER,
	PRIMARY KEY("username")
)