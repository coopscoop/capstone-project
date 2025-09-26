using System.Collections.Generic;

namespace CapstoneLinter;

public class AstInfo
{
    public List<FunctionInfo> Functions { get; set; } = new();
    public List<WildcardImportInfo> WildcardImports { get; set; } = new();
}
