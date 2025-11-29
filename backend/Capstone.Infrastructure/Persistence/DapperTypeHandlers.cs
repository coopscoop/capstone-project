// Create this file: DapperTypeHandlers.cs
using Dapper;
using System.Data;
using System.Collections.Generic;

namespace Capstone.Infrastructure.Persistence;

public class DapperTypeHandlers
{
    public static void RegisterHandlers()
    {
        // Handle string[] to List<string> conversion
        SqlMapper.AddTypeHandler(new StringArrayToListHandler());
    }
}

public class StringArrayToListHandler : SqlMapper.TypeHandler<List<string>>
{
    public override void SetValue(IDbDataParameter parameter, List<string> value)
    {
        parameter.Value = value?.ToArray();
    }

    public override List<string> Parse(object value)
    {
        if (value is string[] stringArray)
        {
            return new List<string>(stringArray);
        }
        
        if (value is string singleString && !string.IsNullOrEmpty(singleString))
        {
            // Handle case where it might come as a single string
            return new List<string> { singleString };
        }
        
        return new List<string>();
    }
}