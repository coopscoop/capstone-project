namespace CapstoneLinter.AST
{
    public class AstNode
    {
        public string NodeType { get; }
        public int Line { get; }
        public int Column { get; }
        public dynamic RawNode { get; }

        public AstNode(dynamic rawNode)
        {
            RawNode = rawNode;
            NodeType = rawNode.GetType().Name;
            Line = rawNode.__dict__.ContainsKey("lineno") ? (int)rawNode.lineno : 0;
            Column = rawNode.__dict__.ContainsKey("col_offset") ? (int)rawNode.col_offset : 0;
        }
    }
}
