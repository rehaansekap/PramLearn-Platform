import os
import django
import psycopg2
import sys


def test_postgresql_service():
    """Test if PostgreSQL service is running"""
    print("🔍 Testing PostgreSQL service...")
    try:
        # Try to connect to postgres database with postgres user
        conn = psycopg2.connect(
            host="localhost",
            database="pramlearn_db",  # Default database
            user="pramadmin",
            password="123123123",  # Ganti dengan password postgres Anda
            port="5432"
        )
        print("✓ PostgreSQL service is running")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ PostgreSQL service test failed: {e}")
        print("💡 Please check if PostgreSQL is running and postgres password is correct")
        return False


def test_user_exists():
    """Test if pramadmin exists"""
    print("\n🔍 Testing if pramadmin exists...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="pramlearn_db",
            user="pramadmin",
            password="123123123",  # Ganti dengan password postgres Anda
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname='pramadmin'")
        result = cursor.fetchone()

        if result:
            print("✓ pramadmin exists")
            return True
        else:
            print("❌ pramadmin does NOT exist")
            return False
    except Exception as e:
        print(f"❌ Error checking user: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()


def test_database_exists():
    """Test if pramlearn_db exists"""
    print("\n🔍 Testing if pramlearn_db exists...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="pramlearn_db",
            user="pramadmin",
            password="123123123",  # Ganti dengan password postgres Anda
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname='pramlearn_db'")
        result = cursor.fetchone()

        if result:
            print("✓ pramlearn_db exists")
            return True
        else:
            print("❌ pramlearn_db does NOT exist")
            return False
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()


def test_user_connection():
    """Test direct PostgreSQL connection with pramadmin"""
    print("\n🔍 Testing pramadmin connection...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="pramlearn_db",
            user="pramadmin",
            password="123123123",
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✓ pramadmin connection successful!")
        print(f"  Version: {version[0][:50]}...")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ pramadmin connection failed: {e}")
        return False


def test_django_connection():
    """Test Django connection"""
    print("\n🔍 Testing Django connection...")
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                              'pramlearn_api.settings')
        django.setup()

        from django.db import connection

        # Test connection
        cursor = connection.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✓ Django PostgreSQL connection successful!")
        print(f"  Version: {version[0][:50]}...")

        return True
    except Exception as e:
        print(f"❌ Django connection failed: {e}")
        return False


def main():
    print("🔍 Detailed PostgreSQL Connection Testing")
    print("=" * 60)

    # Step 1: Test PostgreSQL service
    service_ok = test_postgresql_service()
    if not service_ok:
        print("\n❌ PostgreSQL service is not running or accessible")
        print("💡 Please start PostgreSQL service and try again")
        return

    # Step 2: Test if user exists
    user_exists = test_user_exists()

    # Step 3: Test if database exists
    db_exists = test_database_exists()

    if not user_exists or not db_exists:
        print("\n🛠️  SETUP REQUIRED:")
        print("Run the following commands in psql as postgres user:")
        print("=" * 50)
        if not user_exists:
            print("CREATE USER pramadmin WITH PASSWORD '123123123';")
        if not db_exists:
            print("CREATE DATABASE pramlearn_db OWNER pramadmin;")
        print("GRANT ALL PRIVILEGES ON DATABASE pramlearn_db TO pramadmin;")
        print("ALTER USER pramadmin CREATEDB;")
        print("=" * 50)
        return

    # Step 4: Test user connection
    user_conn_ok = test_user_connection()

    # Step 5: Test Django connection
    django_ok = test_django_connection()

    print("\n" + "=" * 60)
    print("📊 SUMMARY:")
    print(f"  PostgreSQL Service: {'✓' if service_ok else '❌'}")
    print(f"  User Exists: {'✓' if user_exists else '❌'}")
    print(f"  Database Exists: {'✓' if db_exists else '❌'}")
    print(f"  User Connection: {'✓' if user_conn_ok else '❌'}")
    print(f"  Django Connection: {'✓' if django_ok else '❌'}")

    if all([service_ok, user_exists, db_exists, user_conn_ok, django_ok]):
        print("\n🎉 All tests passed! Ready to run migrations.")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")


if __name__ == "__main__":
    main()
