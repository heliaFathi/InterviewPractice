using System.Net.Http;
using Application.Interfaces;
using Application.Services;
using Moq;
using System.Threading.Tasks;
using Moq.Protected;
using System.Threading;
using System.Net;
using System.Collections.Generic;
using Application.Dtos;
using System.Text;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;

namespace Application.UnitTests
{
    public class JobServiceUnitTests
    {
        private IClientService _clientService;

        [Test]
        public async Task ShouldReturnJobs()
        {
            //Arrange
           var jobs = new List<JobDto>();

            jobs.Add(new JobDto()
            {
                JobId = 1,
                Name = "Mobile Developer",
                Company = "Uberise",
                Skills = "mobile, java, swift, objective-c, iOS, xcode, fastlane, aws, kotlin, hockey-app"
            });

            jobs.Add(new JobDto()
            {
                JobId = 2,
                Name = "Reception",
                Company = "Surile",
                Skills = "mobile, java, swift, objective-c, iOS, xcode, fastlane, aws, kotlin, hockey-app"
            });

            var mockFactory = new Mock<IHttpClientFactory>();
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();

            mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage()
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(jobs), Encoding.UTF8, "application/json")
                });

            var client = new HttpClient(mockHttpMessageHandler.Object);
            mockFactory.Setup(_ => _.CreateClient(It.IsAny<string>())).Returns(client);

            var configuration = new Mock<IConfiguration>();

            configuration.Setup(x => x[It.IsAny<string>()]).Returns("http://private-76432-jobadder1.apiary-mock.com/");

            _clientService = new ClientService(client, configuration.Object);

            //Act
            var results = _clientService.GetData<JobDto>("jobs");

            //Assert
            Assert.NotNull(results);
        }
    }
}