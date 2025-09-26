namespace CapstoneLinter;

public interface ILintRule
{
    IEnumerable<LinterResult> Analyze(AstInfo ast);
}
