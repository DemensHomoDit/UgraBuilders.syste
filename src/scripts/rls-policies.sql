
-- This SQL script sets up Row Level Security (RLS) policies for blog_posts and reviews tables
-- to ensure proper access control and permissions management.

-- Function to create policies safely (without errors if they already exist)
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
  policy_name text,
  table_name text,
  action text,
  role_name text,
  using_expr text DEFAULT 'true',
  check_expr text DEFAULT 'true',
  schema_name text DEFAULT 'public'
) RETURNS void AS $$
DECLARE
  policy_exists boolean;
BEGIN
  -- Check if policy already exists
  SELECT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = schema_name
      AND tablename = table_name
      AND policyname = policy_name
  ) INTO policy_exists;
  
  -- Create policy if it doesn't exist
  IF NOT policy_exists THEN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s) WITH CHECK (%s)',
      policy_name,
      schema_name,
      table_name,
      action,
      role_name,
      using_expr,
      check_expr
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to enable RLS on a table if not already enabled
CREATE OR REPLACE FUNCTION enable_rls_if_not_enabled(
  table_name text,
  schema_name text DEFAULT 'public'
) RETURNS void AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  -- Check if RLS is already enabled
  SELECT relrowsecurity FROM pg_class
  JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
  WHERE pg_namespace.nspname = schema_name AND pg_class.relname = table_name
  INTO rls_enabled;
  
  -- Enable RLS if not already enabled
  IF NOT rls_enabled THEN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
      schema_name,
      table_name
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Main procedure to set up all RLS policies
CREATE OR REPLACE PROCEDURE setup_rls_policies() 
LANGUAGE plpgsql AS $$
BEGIN
  -- Enable RLS on blog_posts table
  PERFORM enable_rls_if_not_enabled('blog_posts');
  
  -- Blog posts policies
  PERFORM create_policy_if_not_exists(
    'blog_posts_select_policy',
    'blog_posts',
    'SELECT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_posts_insert_policy',
    'blog_posts',
    'INSERT',
    'authenticated',
    'true',
    'auth.uid() = created_by'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_posts_update_policy',
    'blog_posts',
    'UPDATE',
    'authenticated',
    'auth.uid() = created_by'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_posts_delete_policy',
    'blog_posts',
    'DELETE',
    'authenticated',
    'auth.uid() = created_by'
  );
  
  -- Enable RLS on blog_images table
  PERFORM enable_rls_if_not_enabled('blog_images');
  
  -- Blog images policies
  PERFORM create_policy_if_not_exists(
    'blog_images_select_policy',
    'blog_images',
    'SELECT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_images_insert_policy',
    'blog_images',
    'INSERT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_images_update_policy',
    'blog_images',
    'UPDATE',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'blog_images_delete_policy',
    'blog_images',
    'DELETE',
    'authenticated'
  );
  
  -- Enable RLS on reviews table
  PERFORM enable_rls_if_not_enabled('reviews');
  
  -- Reviews policies
  PERFORM create_policy_if_not_exists(
    'reviews_select_policy',
    'reviews',
    'SELECT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'reviews_insert_policy',
    'reviews',
    'INSERT',
    'authenticated',
    'true',
    'auth.uid() = created_by'
  );
  
  PERFORM create_policy_if_not_exists(
    'reviews_update_policy',
    'reviews',
    'UPDATE',
    'authenticated',
    'auth.uid() = created_by'
  );
  
  PERFORM create_policy_if_not_exists(
    'reviews_delete_policy',
    'reviews',
    'DELETE',
    'authenticated',
    'auth.uid() = created_by'
  );
  
  -- Enable RLS on review_images table
  PERFORM enable_rls_if_not_enabled('review_images');
  
  -- Review images policies
  PERFORM create_policy_if_not_exists(
    'review_images_select_policy',
    'review_images',
    'SELECT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'review_images_insert_policy',
    'review_images',
    'INSERT',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'review_images_update_policy',
    'review_images',
    'UPDATE',
    'authenticated'
  );
  
  PERFORM create_policy_if_not_exists(
    'review_images_delete_policy',
    'review_images',
    'DELETE',
    'authenticated'
  );
  
  -- Add more policies for other tables as needed
END;
$$;

-- Execute the procedure to set up policies
CALL setup_rls_policies();
