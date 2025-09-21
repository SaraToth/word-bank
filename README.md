# word-bank
A web service to learn new words in Korean and store them in your own virtual notebook system for fast vocabulary acquisition.

## Setting Up

Fork a copy of this repository and install dependencies:
```
npm install
```

### Database setup

There is .env-template available. Just delete the "-template" and update with your env variables

You will need to create your own psql database locally and update the DATABASE_URL in your .env
You also need to set your own secret for JWT_SECRET

Then you can run the following to setup the tables in your database:
```
npx prisma migrate deploy
```

and then the following to seed your database with example users
```
npx prisma db seed
```

## Database Schema

### Naming differences in Prisma and PSQL

Since both prisma, and psql have their own naming standards. All fields, where necessary, are mapped to the proper psql naming convention.

Models in schema are capitalized and singular case, whereas tables in psql are lowercase and plural.
**Prisma**: User -> **PSQL** users

Multiple words are handled differently as well. Prisma schema uses camel case while psql uses an underscore
**Prisma** firstName -> **PSQL** first_name

### Database Structure

- **Enum: CategoryType** - for model category type property
    - DEFAULT: Each user has 1 default category "My Words" defined at sign up
        - Used to prevent deletion or renaming
    - CUSTOM: All other categories

- **Enum: Grade**

    Values submitted by users when interacting with space repetition flashcards. Each will have a different impact on review intervals and frequency.

    - FORGOT
    - HARD
    - OKAY
    - EASY


- **User**
    - id, firstName, lastName, email, password
    - Relationships: Categories[], Words[], Reviews[]

- **Category**
    - id, name, slug, 
    - type: enum CategoryType
    - Relationships: userId, Words[]

- **Word**
    - id, kr (korean word), en (english word), example (example sentence)
    - Relationships: userId, Categories[] - words can be in multiple, Reviews[]

- **ReviewProcess**
    - id
    - lastReviewed - When the word was last reviewed
    - nextReview - When the word will be reviewed next
    - interval - The amount of time before next review
    - easeFactor - Multiplication factor for review (default 2.5)
    - repetition - How many times the word has been reviewed
    - grade - enum Grade - Feedback from user during review
    - Relationships: userId, wordId, Categories[], 

    ### Space Repetition 

    The model ReviewProcess is based on standards of spaced repetition software such as a default ease factor of 2.5. 

## naverFetch.js

Fetches Korean to English words from naver's papago API.js file.

In order to utilize this, you will need to signup with Naver's papago API and get the two necessary keys for the .env file.

At the moment, this API does not utilize this fetch call and exists for potential further feature developments.

## Testing

All routes and controller logic were tested with Jest and Supertest.

If you want to run tests, make sure jest and supertest are installed and that you have created a seperate psql database locally.

Update the test database url in .env and then run

```
npm run test
```

to launch the test suite.
