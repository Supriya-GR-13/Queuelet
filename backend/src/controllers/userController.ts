import { Request, Response } from "express";
import pool from "../config/database";

// Get an existing user by email, or create one if it doesn't exist yet.
// This powers the frontend's "Continue as Demo User" flow — there is no
// real auth in this project yet, so we just upsert a user record by email.
export const loginOrCreateUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required"
      });
    }

    const existing = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: "User found",
        user: existing.rows[0]
      });
    }

    const created = await pool.query(
      `INSERT INTO users (name, email)
       VALUES ($1, $2)
       RETURNING *`,
      [name || "Demo User", email]
    );

    return res.status(201).json({
      message: "User created",
      user: created.rows[0]
    });

  } catch (error) {
    console.error("Login/create user error:", error);

    return res.status(500).json({
      message: "Failed to log in user"
    });
  }
};

// Get a single user by id
export const getUserById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Failed to fetch user"
    });
  }
};
