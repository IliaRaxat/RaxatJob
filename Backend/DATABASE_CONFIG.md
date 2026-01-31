# Database Configuration Guide

## Fixing "Too Many Clients" Error

The error you're experiencing is caused by too many database connections being opened simultaneously. Here's how to fix it:

### 1. Environment Variables

Create a `.env` file in your project root with the following configuration:

```env
# Database Configuration with connection pooling
DATABASE_URL="postgresql://username:password@localhost:5432/smartmatch?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10"

# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_CONNECTION_TIMEOUT=10000
DB_QUERY_TIMEOUT=30000
```

### 2. Prisma Configuration

The PrismaService has been updated with proper connection management:

- **Safe Execute**: Automatic retry mechanism for connection errors
- **Connection Health Monitoring**: Check connection status
- **Error Recovery**: Automatic retry for "too many clients" errors
- **Proper Cleanup**: Ensures connections are properly closed

### 3. Database URL Parameters

Add these parameters to your DATABASE_URL:

```
postgresql://username:password@localhost:5432/smartmatch?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10
```

### 4. PostgreSQL Configuration

If you're using PostgreSQL, you can also adjust these settings in your `postgresql.conf`:

```conf
# Maximum number of connections
max_connections = 100

# Connection timeout
tcp_keepalives_idle = 600
tcp_keepalives_interval = 30
tcp_keepalives_count = 3
```

### 5. Application-Level Fixes

The following improvements have been made:

1. **PrismaService**: Added connection pooling and timeout settings
2. **ResumesService**: All database operations now use `safeExecute()` method
3. **Error Handling**: Automatic retry for "too many clients" errors
4. **Connection Monitoring**: Added connection health checks

### 6. Testing the Fix

After implementing these changes:

1. Restart your application
2. Monitor the console for connection messages
3. Test the `/resumes` endpoint that was failing
4. Check that connections are properly managed

### 7. Monitoring

The application now logs:
- ✅ Database connected successfully
- ✅ Database disconnected successfully
- ⚠️ Too many database connections, retrying...

### 8. Additional Recommendations

1. **Use Connection Pooling**: Consider using PgBouncer for production
2. **Monitor Connections**: Set up monitoring for database connections
3. **Optimize Queries**: Review and optimize slow database queries
4. **Use Transactions**: Wrap related operations in transactions

### 9. Production Considerations

For production environments:

1. Use a connection pooler like PgBouncer
2. Set appropriate connection limits
3. Monitor database performance
4. Use read replicas for read-heavy operations
5. Implement proper error handling and retry logic

This should resolve the "too many clients" error you were experiencing.
