using System.Collections.Generic;
using Python.Runtime;

namespace CapstoneLinter.AST
{
    public static class AstWalker
    {
        public static IEnumerable<AstNode> Walk(dynamic node)
        {
            yield return new AstNode(node);

            foreach (var field in node._fields)
            {
                dynamic child = node.__getattribute__(field);
                if (child == null) continue;

                if (child is PyObject pyObj && pyObj.IsIterable())
                {
                    foreach (dynamic c in child)
                        foreach (var desc in Walk(c))
                            yield return desc;
                }
                else
                {
                    foreach (var desc in Walk(child))
                        yield return desc;
                }
            }
        }
    }
}
